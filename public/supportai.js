(function() {
  'use strict';

  var WIDGET_ID = 'supportai-widget';
  var DEFAULT_SETTINGS = {
    company_name: 'Demo',
    primary_color: '#6366f1',
    header_color: '#202020',
    widget_body: '#202020',
    user_bgcolor: '#1e1b4b',
    ai_bgcolor: '#27272a',
    message_text_color: '#f4f4f5',
    send_icon_color: '#6366f1',
    logo_color: '#ffffff',
    position: 'bottom-right'
  };
  var settings = DEFAULT_SETTINGS;

  function adjustBrightness(hex, percent) {
    var num = parseInt(hex.replace('#', ''), 16);
    var r = Math.max(0, Math.min(255, (num >> 16) + percent));
    var g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + percent));
    var b = Math.max(0, Math.min(255, (num & 0x0000FF) + percent));
    return '#' + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
  }

  function getHeaderColor() {
    return settings.header_color || '#0a0a0f';
  }

  function getWidgetCircleColor() {
    return settings.primary_color || '#6366f1';
  }

  function getUserBgColor() {
    return settings.user_bgcolor || adjustBrightness(settings.primary_color, -30);
  }

  function getAiBgColor() {
    return settings.ai_bgcolor || 'rgba(255,255,255,0.1)';
  }

  function init() {
    console.log('SupportAI: init started');
    console.log('SupportAI: window.supportai_user_id:', window.supportai_user_id);
    console.log('SupportAI: window.supportai_server_url:', window.supportai_server_url);
    
    // Support hash-based config for CSP compatibility
    if (window.location.hash) {
      try {
        const params = new URLSearchParams(window.location.hash.slice(1));
        const hashUserId = params.get('supportai_user_id');
        const hashServerUrl = params.get('supportai_server_url');
        if (hashUserId) window.supportai_user_id = hashUserId;
        if (hashServerUrl) window.supportai_server_url = hashServerUrl;
        console.log('SupportAI: Loaded from hash:', { hashUserId, hashServerUrl });
      } catch (e) {
        console.log('SupportAI: Could not parse hash params');
      }
    }

    var existing = document.getElementById(WIDGET_ID);
    if (existing) {
      existing.parentNode.removeChild(existing);
    }

    // Fetch settings first, then render widget with correct settings
    fetchWidgetSettings().then(function() {
      renderWidget();
    });
  }

  function getApiBaseUrl() {
    return window.supportai_server_url || window.location.origin;
  }

  function fetchWidgetSettings() {
    var userId = window.supportai_user_id;
    if (!userId) {
      console.log('SupportAI: No userId set, skipping settings fetch');
      return Promise.resolve();
    }
    
    var url = getApiBaseUrl() + '/api/widget?userId=' + encodeURIComponent(userId) + '&t=' + Date.now();
    console.log('SupportAI: Fetching settings from:', url);
    
    return fetch(url, {
      method: 'GET',
      credentials: 'omit',
      headers: {
        'Accept': 'application/json'
      }
    })
      .then(function(res) {
        console.log('SupportAI: Settings response status:', res.status);
        return res.json();
      })
      .then(function(data) {
        console.log('SupportAI: Settings response:', data);
        if (data && (data.company_name || data.primary_color)) {
          settings = data;
          console.log('SupportAI: Settings applied', settings);
        } else {
          console.log('SupportAI: No valid settings in response, using defaults');
        }
      })
      .catch(function(err) {
        console.log('SupportAI: Error fetching settings, using defaults', err);
      });
  }

  function renderWidget() {
    var container = document.createElement('div');
    container.id = WIDGET_ID;
    container.innerHTML = getWidgetHTML();
    document.body.appendChild(container);

    bindEvents(container);
  }

  function getWidgetHTML() {
    var pos = settings.position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;';
    return '<style>' +
      '#' + WIDGET_ID + ' {' +
        'position: fixed;' +
        'bottom: 20px;' +
        pos +
        'z-index: 999999;' +
        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;' +
      '}' +
      '#' + WIDGET_ID + ' * {' +
        'box-sizing: border-box;' +
      '}' +
      '.sa-toggle {' +
        'width: 60px;' +
        'height: 60px;' +
        'border-radius: 50%;' +
        'background: ' + getWidgetCircleColor() + ';' +
        'border: none;' +
        'cursor: pointer;' +
        'box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;' +
      '}' +
      '.sa-toggle:hover {' +
        'transform: scale(1.05);' +
      '}' +
      '.sa-toggle svg {' +
        'width: 28px;' +
        'height: 28px;' +
      '}' +
      '.sa-chat {' +
        'position: absolute;' +
        'bottom: 70px;' +
        (settings.position === 'bottom-left' ? 'left: 0;' : 'right: 0;') +
        'width: 380px;' +
        'height: 500px;' +
        'max-height: calc(100vh - 100px);' +
        'background: linear-gradient(180deg, ' + getHeaderColor() + ' 0%, ' + adjustBrightness(getHeaderColor(), -10) + ' 100%);' +
        'border-radius: 16px;' +
        'box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);' +
        'display: none;' +
        'flex-direction: column;' +
        'overflow: hidden;' +
        'border: 1px solid rgba(0,0,0,0.1);' +
      '}' +
      '.sa-chat.open {' +
        'display: flex;' +
      '}' +
      '.sa-header {' +
        'padding: 16px;' +
        'background: ' + getHeaderColor() + ';' +
        'border-bottom: 1px solid rgba(0,0,0,0.1);' +
        'display: flex;' +
        'align-items: center;' +
        'gap: 12px;' +
      '}' +
      '.sa-header-title {' +
        'font-weight: 600;' +
        'color: ' + settings.message_text_color + ';' +
      '}' +
      '.sa-messages {' +
        'flex: 1;' +
        'overflow-y: auto;' +
        'padding: 16px;' +
        'display: flex;' +
        'flex-direction: column;' +
        'gap: 12px;' +
        'align-items: stretch;' +
      '}' +
      '.sa-message {' +
        'max-width: 85%;' +
        'padding: 12px 16px;' +
        'border-radius: 16px;' +
        'font-size: 14px;' +
        'line-height: 1.5;' +
        'white-space: pre-wrap;' +
      '}' +
      '.sa-message-user {' +
        'align-self: flex-end;' +
        'background: ' + getUserBgColor() + ';' +
        'color: ' + settings.message_text_color + ';' +
      '}' +
      '.sa-message-assistant {' +
        'align-self: flex-start;' +
        'background: ' + getAiBgColor() + ';' +
        'color: ' + settings.message_text_color + ';' +
      '}' +
      '.sa-input-area {' +
        'padding: 12px;' +
        'background: ' + getHeaderColor() + ';' +
        'border-top: 1px solid rgba(0,0,0,0.1);' +
        'display: flex;' +
        'gap: 8px;' +
      '}' +
      '.sa-input {' +
        'flex: 1;' +
        'padding: 12px 16px;' +
        'border-radius: 24px;' +
        'border: 1px solid rgba(255,255,255,0.2);' +
        'background: rgba(255,255,255,0.1);' +
        'color: ' + settings.message_text_color + ';' +
        'font-size: 14px;' +
        'outline: none;' +
      '}' +
      '.sa-input::placeholder {' +
        'color: ' + settings.message_text_color + ';' +
        'opacity: 0.7;' +
      '}' +
      '.sa-input:focus {' +
        'border-color: ' + settings.message_text_color + ';' +
      '}' +
      '.sa-send {' +
        'width: 44px;' +
        'height: 44px;' +
        'border-radius: 50%;' +
        'background: ' + getWidgetCircleColor() + ';' +
        'border: none;' +
        'cursor: pointer;' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;' +
      '}' +
      '.sa-send:disabled {' +
        'opacity: 0.5;' +
        'cursor: not-allowed;' +
      '}' +
      '.sa-send svg {' +
        'width: 20px;' +
        'height: 20px;' +
        'fill: #ffffff;' +
      '}' +
    '.sa-typing-dots {' +
          'padding: 12px 16px;' +
          'border-radius: 16px;' +
          'background: ' + getAiBgColor() + ';' +
          'display: inline-flex;' +
          'gap: 6px;' +
          'align-items: center;' +
          'max-width: 85%;' +
        '}' +
        '.sa-typing-dot {' +
          'width: 6px;' +
          'height: 6px;' +
          'border-radius: 50%;' +
          'background: ' + settings.message_text_color + ';' +
          'animation: sa-pulse 1.4s ease-in-out infinite;' +
        '}' +
        '.sa-typing-dot:nth-child(2) { animation-delay: 0.2s; }' +
        '.sa-typing-dot:nth-child(3) { animation-delay: 0.4s; }' +
        '@keyframes sa-pulse {' +
          '0%, 100% { opacity: 0.4; }' +
          '50% { opacity: 1; }' +
        '}' +
        '.sa-typing.show {' +
          'display: flex;' +
          'flex-direction: row;' +
          'gap: 4px;' +
        '}' +
        '.sa-typing-dot {' +
          'width: 6px;' +
          'height: 6px;' +
          'border-radius: 50%;' +
          'background: ' + settings.message_text_color + ';' +
          'animation: sa-pulse 1.4s ease-in-out infinite;' +
        '}' +
        '.sa-typing-dot {' +
          'width: 8px;' +
          'height: 8px;' +
          'border-radius: 50%;' +
          'background: ' + settings.message_text_color + ';' +
          'opacity: 0.4;' +
          'animation: sa-pulse 1.4s ease-in-out infinite;' +
        '}' +
        '.sa-typing-dot:nth-child(2) { animation-delay: 0.2s; }' +
        '.sa-typing-dot:nth-child(3) { animation-delay: 0.4s; }' +
        '@keyframes sa-pulse {' +
          '0%, 100% { opacity: 0.4; }' +
          '50% { opacity: 1; }' +
        '}' +
        '@media (max-width: 480px) {' +
          '#' + WIDGET_ID + ' { bottom: 10px; right: 10px; }' +
          '.sa-chat { width: calc(100vw - 20px); height: calc(100vh - 80px); bottom: 70px; }' +
        '}' +
      '</style>' +
      '<button class="sa-toggle" aria-label="Open chat">' +
        '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">' +
          '<defs>' +
            '<linearGradient id="sa-gradient" x1="0%" y1="0%" x2="100%" y2="100%">' +
              '<stop offset="0%" stopColor="' + getWidgetCircleColor() + '" />' +
              '<stop offset="100%" stopColor="' + adjustBrightness(getWidgetCircleColor(), 30) + '" />' +
            '</linearGradient>' +
            '<filter id="sa-glow">' +
              '<feGaussianBlur stdDeviation="0.8" result="coloredBlur"/>' +
              '<feMerge>' +
                '<feMergeNode in="coloredBlur"/>' +
                '<feMergeNode in="SourceGraphic"/>' +
              '</feMerge>' +
            '</filter>' +
          '</defs>' +
          '<path d="M8 8C8 8 8 14 8 18.5C8 22.5 10 25.5 13 25.5C13 25.5 17.5 27 17.5 27L32 32V18C32 8.5 21 4 13 4C8.5 4 5 6.5 4.5 10L8 8Z" fill="' + settings.logo_color + '"/>' +
        '</svg>' +
      '</button>' +
      '<div class="sa-chat">' +
        '<div class="sa-header">' +
          '<span class="sa-header-title">' + settings.company_name + ' Support AI</span>' +
        '</div>' +
        '<div class="sa-messages">' +
          '<div class="sa-message sa-message-assistant">Hello! How can I help you today?</div>' +
        '</div>' +
        '<div class="sa-input-area">' +
          '<input type="text" class="sa-input" placeholder="Type a message..." />' +
          '<button class="sa-send" aria-label="Send">' +
            '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>';
  }

  function bindEvents(container) {
    var toggle = container.querySelector('.sa-toggle');
    var chat = container.querySelector('.sa-chat');
    var input = container.querySelector('.sa-input');
    var send = container.querySelector('.sa-send');
    var messages = container.querySelector('.sa-messages');

    toggle.addEventListener('click', function() {
      chat.classList.toggle('open');
      if (chat.classList.contains('open')) {
        input.focus();
      }
    });

    send.addEventListener('click', function() {
      sendMessage();
    });

    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });

    function sendMessage() {
      var message = input.value.trim();
      if (!message) return;

      addMessage(message, 'user');
      input.value = '';
      
      var typingEl = document.createElement('div');
      typingEl.className = 'sa-message sa-message-assistant sa-typing-dots';
      typingEl.innerHTML = '<span class="sa-typing-dot"></span><span class="sa-typing-dot"></span><span class="sa-typing-dot"></span>';
      messages.appendChild(typingEl);
      messages.scrollTop = messages.scrollHeight;
      send.disabled = true;

      var userMsg = message;
      var userId = window.supportai_user_id;
      console.log('SupportAI: Sending message with userId:', userId);
      fetch(getApiBaseUrl() + '/api/widget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, userId: userId })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        messages.removeChild(typingEl);
        send.disabled = false;
        if (data.error) {
          addMessage(data.error, 'assistant');
        } else {
          addMessage(data.response, 'assistant');
        }
      })
      .catch(function() {
        if (typingEl.parentNode) {
          messages.removeChild(typingEl);
        }
        send.disabled = false;
        addMessage('Failed to get response.', 'assistant');
      });
    }

    function addMessage(content, role) {
      var div = document.createElement('div');
      div.className = 'sa-message sa-message-' + role;
      div.textContent = content;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
