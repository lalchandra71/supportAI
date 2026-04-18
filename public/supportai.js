(function() {
  'use strict';

  var WIDGET_ID = 'supportai-widget';

  function init() {
    if (document.getElementById(WIDGET_ID)) return;

    var container = document.createElement('div');
    container.id = WIDGET_ID;
    container.innerHTML = getWidgetHTML();
    document.body.appendChild(container);

    bindEvents(container);
  }

  function getWidgetHTML() {
    return '<style>' +
      '#' + WIDGET_ID + ' {' +
        'position: fixed;' +
        'bottom: 20px;' +
        'right: 20px;' +
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
        'background: linear-gradient(135deg, #6366f1, #818cf8);' +
        'border: none;' +
        'cursor: pointer;' +
        'box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);' +
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
        'right: 0;' +
        'width: 380px;' +
        'height: 500px;' +
        'max-height: calc(100vh - 100px);' +
        'background: #12121a;' +
        'border-radius: 16px;' +
        'box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);' +
        'display: none;' +
        'flex-direction: column;' +
        'overflow: hidden;' +
        'border: 1px solid #27272a;' +
      '}' +
      '.sa-chat.open {' +
        'display: flex;' +
      '}' +
      '.sa-header {' +
        'padding: 16px;' +
        'background: #1a1a24;' +
        'border-bottom: 1px solid #27272a;' +
        'display: flex;' +
        'align-items: center;' +
        'gap: 12px;' +
      '}' +
      '.sa-header-title {' +
        'font-weight: 600;' +
        'color: #f4f4f5;' +
      '}' +
      '.sa-messages {' +
        'flex: 1;' +
        'overflow-y: auto;' +
        'padding: 16px;' +
        'display: flex;' +
        'flex-direction: column;' +
        'gap: 12px;' +
        'align-items: flex-start;' +
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
        'background: #1e1b4b;' +
        'color: white;' +
      '}' +
      '.sa-message-assistant {' +
        'align-self: flex-start;' +
        'background: #27272a;' +
        'color: #f4f4f5;' +
      '}' +
      '.sa-input-area {' +
        'padding: 12px;' +
        'background: #1a1a24;' +
        'border-top: 1px solid #27272a;' +
        'display: flex;' +
        'gap: 8px;' +
      '}' +
      '.sa-input {' +
        'flex: 1;' +
        'padding: 12px 16px;' +
        'border-radius: 24px;' +
        'border: 1px solid #27272a;' +
        'background: #12121a;' +
        'color: #f4f4f5;' +
        'font-size: 14px;' +
        'outline: none;' +
      '}' +
      '.sa-input:focus {' +
        'border-color: #6366f1;' +
      '}' +
      '.sa-send {' +
        'width: 44px;' +
        'height: 44px;' +
        'border-radius: 50%;' +
        'background: #6366f1;' +
        'border: none;' +
        'cursor: pointer;' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;' +
      '}' +
      '.sa-send:disabled {' +
        'background: #27272a;' +
        'cursor: not-allowed;' +
      '}' +
      '.sa-send svg {' +
        'width: 20px;' +
        'height: 20px;' +
        'fill: white;' +
      '}' +
      '.sa-typing {' +
        'display: none;' +
        'padding: 12px 16px;' +
        'border-radius: 16px;' +
        'background: #27272a;' +
        'margin-top: 8px;' +
        'align-self: flex-start;' +
      '}' +
      '.sa-typing.show {' +
        'display: block;' +
      '}' +
      '.sa-typing-dots {' +
        'display: flex;' +
        'gap: 4px;' +
      '}' +
      '.sa-typing-dot {' +
        'width: 8px;' +
        'height: 8px;' +
        'border-radius: 50%;' +
        'background: #6366f1;' +
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
            '<stop offset="0%" stopColor="#6366f1" />' +
            '<stop offset="100%" stopColor="#818cf8" />' +
          '</linearGradient>' +
          '<filter id="sa-glow">' +
            '<feGaussianBlur stdDeviation="0.8" result="coloredBlur"/>' +
            '<feMerge>' +
              '<feMergeNode in="coloredBlur"/>' +
              '<feMergeNode in="SourceGraphic"/>' +
            '</feMerge>' +
          '</filter>' +
        '</defs>' +
        '<path d="M8 8C8 8 8 14 8 18.5C8 22.5 10 25.5 13 25.5C13 25.5 17.5 27 17.5 27L32 32V18C32 8.5 21 4 13 4C8.5 4 5 6.5 4.5 10L8 8Z" fill="url(#sa-gradient)" filter="url(#sa-glow)"/>' +
        '<g fill="#ffffff" filter="url(#sa-glow)">' +
          '<path d="M20 13L20.5 15L22 15.5L21 17L21.5 19L20 18L18.5 19L19 17L18 15.5L19.5 15L20 13Z" />' +
          '<path d="M25 14L25.5 16L27 16.5L26 18.5L26.5 20.5L25 19.5L23.5 20.5L24 18.5L23 16.5L24.5 16L25 14Z" opacity="0.7"/>' +
          '<path d="M15 14L15.5 16L17 16.5L16 18.5L16.5 20.5L15 19.5L13.5 20.5L14 18.5L13 16.5L14.5 16L15 14Z" opacity="0.7"/>' +
        '</g>' +
      '</svg>' +
    '</button>' +
    '<div class="sa-chat">' +
      '<div class="sa-header">' +
        '<span class="sa-header-title">SupportAI</span>' +
      '</div>' +
      '<div class="sa-messages">' +
        '<div class="sa-message sa-message-assistant">Hello! How can I help you today?</div>' +
        '<div class="sa-typing">' +
          '<div class="sa-typing-dots">' +
            '<div class="sa-typing-dot"></div>' +
            '<div class="sa-typing-dot"></div>' +
            '<div class="sa-typing-dot"></div>' +
          '</div>' +
        '</div>' +
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
    var typing = container.querySelector('.sa-typing');

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
      typing.classList.add('show');
      send.disabled = true;

      var userMsg = message;
      fetch('/api/widget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        typing.classList.remove('show');
        send.disabled = false;
        if (data.error) {
          addMessage(data.error, 'assistant');
        } else {
          addMessage(data.response, 'assistant');
        }
      })
      .catch(function() {
        typing.classList.remove('show');
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