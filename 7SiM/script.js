document.addEventListener("DOMContentLoaded", function() {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;
      const confirm = document.getElementById('reg-confirm-password').value;

      if (password !== confirm) {
        alert('两次输入的密码不一致');
        return;
      }

      try {
        const res = await fetch('https://你的后端域名.onrender.com/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (res.ok) {
          alert('注册成功！请检查您的邮箱以完成验证。');
        } else {
          alert(data.error || '注册失败');
        }
      } catch (err) {
        alert('网络错误，请稍后再试');
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      try {
        const res = await fetch('https://你的后端域名.onrender.com/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (res.ok) {
          alert('登录成功！');
          window.location.href = 'https://你的用户名.github.io/7sim-email-verify/dashboard.html';
        } else {
          alert(data.error || '登录失败');
        }
      } catch (err) {
        alert('网络错误，请稍后再试');
      }
    });
  }
});
