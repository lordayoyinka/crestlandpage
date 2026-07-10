// jsfiles/check-status.js
const form = document.getElementById('statusForm');
const checkBtn = document.getElementById('checkBtn');
const errorBox = document.getElementById('statusError');
const resultBox = document.getElementById('resultBox');

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.style.display = 'block';
  resultBox.style.display = 'none';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBox.style.display = 'none';
  resultBox.style.display = 'none';

  const formData = new FormData(form);
  const applicationRef = formData.get('applicationRef').trim();
  const surname = formData.get('surname').trim();

  checkBtn.disabled = true;
  checkBtn.textContent = 'Checking...';

  try {
    const res = await fetch('/api/check-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationRef, surname }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Something went wrong. Please try again.');
    }

    if (!data.found) {
      showError('No matching application found. Double-check your Application Reference Number and surname, then try again.');
      return;
    }

    renderResult(data);
  } catch (err) {
    console.error(err);
    showError(err.message || 'Something went wrong. Please try again.');
  } finally {
    checkBtn.disabled = false;
    checkBtn.textContent = 'Check Status';
  }
});

function renderResult(data) {
  if (data.status === 'confirmed') {
    resultBox.innerHTML = `
      <div class="payment-box" style="background:#e8f5e9; border-color:#a5d6a7;">
        <h2 style="color:#00693d;">Payment Confirmed</h2>
        <p>Great news, ${data.studentName}'s application has been confirmed. Here are the entrance exam details:</p>
        <ul>
          <li><strong>Exam Number:</strong> ${data.examNumber}</li>
          <li><strong>Passkey:</strong> ${data.passkey}</li>
        </ul>
        <p>Keep these safe — you'll need them to log in on exam day.</p>
      </div>
    `;
  } else {
    resultBox.innerHTML = `
      <div class="payment-box">
        <h2>Payment Pending</h2>
        <p>We've received ${data.studentName}'s application, but haven't confirmed your payment yet.
        Once it's confirmed, your Exam Number and Passkey will be emailed to you and will also appear here.</p>
      </div>
    `;
  }
  resultBox.style.display = 'block';
}
