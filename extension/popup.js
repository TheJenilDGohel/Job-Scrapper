const SESSION_TOKEN = 'job-discovery-secure-2026';
const API_URL = 'http://localhost:3000/api/v1/internal/discovery/jobs';

document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const urlInput = document.getElementById('url');
  const titleInput = document.getElementById('title');
  const companyInput = document.getElementById('company');
  const statusDiv = document.getElementById('status');
  const saveBtn = document.getElementById('save-btn');

  urlInput.value = tab.url;

  // Attempt to pre-fill from tab title
  const tabTitle = tab.title || '';
  if (tabTitle.includes(' | ')) {
    const parts = tabTitle.split(' | ');
    titleInput.value = parts[0].trim();
    if (parts[1]) companyInput.value = parts[1].trim();
  } else if (tabTitle.includes(' - ')) {
    const parts = tabTitle.split(' - ');
    titleInput.value = parts[0].trim();
    if (parts[1]) companyInput.value = parts[1].trim();
  }

  saveBtn.addEventListener('click', async () => {
    const data = {
      jobTitle: titleInput.value,
      company: companyInput.value,
      url: urlInput.value,
      location: document.getElementById('location').value,
      source: 'extension'
    };

    if (!data.jobTitle || !data.company) {
      statusDiv.textContent = 'Please fill title and company';
      statusDiv.className = 'error';
      return;
    }

    try {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-session': SESSION_TOKEN
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        statusDiv.textContent = 'Successfully saved to dashboard!';
        statusDiv.className = 'success';
        setTimeout(() => window.close(), 1500);
      } else {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save');
      }
    } catch (error) {
      statusDiv.textContent = 'Error: ' + error.message;
      statusDiv.className = 'error';
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save to Dashboard';
    }
  });
});
