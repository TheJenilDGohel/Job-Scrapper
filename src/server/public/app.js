// Production Security: Use environment-driven session tokens if possible. 
// For this local engine, we use a constant that can be overridden by the server.
const SESSION_TOKEN = 'job-discovery-secure-2026'; 

let allJobs = [];
let currentView = 'discovery'; // 'discovery' or 'tracker'

document.addEventListener('DOMContentLoaded', () => {
    fetchJobs();

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterAndRenderJobs();
        });
    }

    // Navigation switching
    const navDiscovery = document.getElementById('nav-discovery');
    const navTracker = document.getElementById('nav-tracker');
    const navTable = document.getElementById('nav-table');
    const navAnalytics = document.getElementById('nav-analytics');
    const navProfiles = document.getElementById('nav-profiles');
    const discoveryFilters = document.getElementById('discovery-filters');
    const jobGrid = document.getElementById('job-grid');
    const trackerView = document.getElementById('tracker-view');
    const tableView = document.getElementById('table-view');
    const analyticsView = document.getElementById('analytics-view');
    const profilesView = document.getElementById('profiles-view');
    const viewTitle = document.getElementById('view-title');

    if (navDiscovery && navTracker && navTable && navAnalytics && navProfiles) {
        navDiscovery.addEventListener('click', () => {
            currentView = 'discovery';
            navDiscovery.classList.add('active');
            [navTracker, navTable, navAnalytics, navProfiles].forEach(el => el.classList.remove('active'));
            discoveryFilters.style.display = 'block';
            jobGrid.style.display = 'grid';
            [trackerView, tableView, analyticsView, profilesView].forEach(el => el.style.display = 'none');
            viewTitle.textContent = 'All Discoveries';
            filterAndRenderJobs();
        });

        navTracker.addEventListener('click', () => {
            currentView = 'tracker';
            navTracker.classList.add('active');
            [navDiscovery, navTable, navAnalytics, navProfiles].forEach(el => el.classList.remove('active'));
            discoveryFilters.style.display = 'none';
            jobGrid.style.display = 'none';
            trackerView.style.display = 'block';
            [tableView, analyticsView, profilesView].forEach(el => el.style.display = 'none');
            viewTitle.textContent = 'Application Tracker';
            renderTracker();
        });

        navTable.addEventListener('click', () => {
            currentView = 'table';
            navTable.classList.add('active');
            [navDiscovery, navTracker, navAnalytics, navProfiles].forEach(el => el.classList.remove('active'));
            discoveryFilters.style.display = 'none';
            jobGrid.style.display = 'none';
            tableView.style.display = 'block';
            [trackerView, analyticsView, profilesView].forEach(el => el.style.display = 'none');
            viewTitle.textContent = 'Spreadsheet View';
            renderTableView();
        });

        navAnalytics.addEventListener('click', () => {
            currentView = 'analytics';
            navAnalytics.classList.add('active');
            [navDiscovery, navTracker, navTable, navProfiles].forEach(el => el.classList.remove('active'));
            discoveryFilters.style.display = 'none';
            jobGrid.style.display = 'none';
            analyticsView.style.display = 'block';
            [trackerView, tableView, profilesView].forEach(el => el.style.display = 'none');
            viewTitle.textContent = 'Search Analytics';
            renderAnalytics();
        });

        navProfiles.addEventListener('click', () => {
            currentView = 'profiles';
            navProfiles.classList.add('active');
            [navDiscovery, navTracker, navTable, navAnalytics].forEach(el => el.classList.remove('active'));
            discoveryFilters.style.display = 'none';
            jobGrid.style.display = 'none';
            profilesView.style.display = 'block';
            [trackerView, tableView, analyticsView].forEach(el => el.style.display = 'none');
            viewTitle.textContent = 'Career Profiles';
            renderProfiles();
        });
    }

    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', uploadProfile);
    }

    const exportCsvBtn = document.getElementById('export-csv-btn');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', downloadCSV);
    }

    const filterBtns = document.querySelectorAll('.btn-sidebar');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const viewTitle = document.getElementById('view-title');
            if (viewTitle) viewTitle.textContent = btn.textContent;
            
            filterAndRenderJobs();
        });
    });

    const syncBtn = document.getElementById('sync-btn');
    if (syncBtn) {
        syncBtn.addEventListener('click', triggerManualScrape);
    }

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            filterAndRenderJobs();
        });
    }
});

/**
 * Lightweight HTML Sanitizer to prevent XSS from scraped content
 */
function sanitizeHTML(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

async function fetchJobs() {
    try {
        const response = await fetch('/api/v1/internal/discovery/jobs_data_secure', {
            headers: {
                'x-internal-session': SESSION_TOKEN
            }
        });
        if (!response.ok) {
            if (response.status === 403) throw new Error('Unauthorized: Session token invalid.');
            throw new Error('Failed to fetch jobs');
        }
        const data = await response.json();
        allJobs = data.jobs || [];
        
        updateStats();
        updateMetadata(data.metadata);
        filterAndRenderJobs();
    } catch (error) {
        console.error(error);
        document.getElementById('job-grid').innerHTML = `
            <div class="loading-state">
                <p style="color: #ef4444;">${sanitizeHTML(error.message)}</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.7;">Check server logs for details.</p>
            </div>
        `;
    }
}

function updateMetadata(meta) {
    if (!meta) return;
    
    const lastUpdated = document.getElementById('last-updated');
    const syncDot = document.getElementById('sync-dot');
    
    if (meta.isScraping) {
        lastUpdated.textContent = 'Discovery in progress...';
        syncDot.className = 'dot processing';
    } else {
        syncDot.className = 'dot active';
        if (meta.lastScrapedAt) {
            const date = new Date(meta.lastScrapedAt);
            lastUpdated.textContent = `Last sync: ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            lastUpdated.textContent = 'System Active';
        }
    }
}

async function triggerManualScrape() {
    const syncBtn = document.getElementById('sync-btn');
    const originalText = syncBtn.innerHTML;
    
    try {
        syncBtn.disabled = true;
        syncBtn.innerHTML = 'Starting...';
        
        const response = await fetch('/api/v1/internal/discovery/trigger_scrape', {
            method: 'POST',
            headers: {
                'x-internal-session': SESSION_TOKEN
            }
        });
        
        if (response.ok) {
            syncBtn.innerHTML = 'Scraping...';
            // Start polling for status
            pollScrapeStatus();
        } else {
            const err = await response.json();
            alert(err.error || 'Failed to start scrape');
            syncBtn.disabled = false;
            syncBtn.innerHTML = originalText;
        }
    } catch (error) {
        console.error(error);
        syncBtn.disabled = false;
        syncBtn.innerHTML = originalText;
    }
}

let statusPollInterval = null;
function pollScrapeStatus() {
    if (statusPollInterval) clearInterval(statusPollInterval);
    
    statusPollInterval = setInterval(async () => {
        await fetchJobs();
        const syncDot = document.getElementById('sync-dot');
        if (syncDot && !syncDot.classList.contains('processing')) {
            clearInterval(statusPollInterval);
            const syncBtn = document.getElementById('sync-btn');
            syncBtn.disabled = false;
            syncBtn.innerHTML = `
                <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"></path></svg>
                Sync Jobs Now
            `;
        }
    }, 5000);
}

function updateStats() {
    const total = allJobs.length;
    document.getElementById('total-jobs').textContent = total;

    if (total > 0) {
        const avg = Math.round(allJobs.reduce((acc, job) => acc + (job.score || 0), 0) / total);
        const high = allJobs.filter(j => j.score > 75).length;

        document.getElementById('avg-score').textContent = `${avg}%`;
        document.getElementById('high-matches').textContent = high;
    }
}

async function tailorResume(jobId) {
    const btn = document.getElementById('tailor-btn');
    const section = document.getElementById('tailor-section');
    const container = document.getElementById('tailor-results');

    if (!btn || !section || !container) return;

    try {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner" style="width: 14px; height: 14px; margin: 0; display: inline-block;"></span> Analyzing JD...';
        section.style.display = 'block';
        container.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>AI is analyzing your resume against this job description...</p></div>';
        
        // Scroll to tailoring section
        section.scrollIntoView({ behavior: 'smooth' });

        const response = await fetch(`/api/v1/internal/discovery/jobs/${jobId}/tailor`, {
            method: 'POST',
            headers: {
                'x-internal-session': SESSION_TOKEN
            }
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to generate suggestions');
        }

        const data = await response.json();
        
        // Render results
        let html = `
            <div class="tailor-summary">${sanitizeHTML(data.summary)}</div>
            <div class="suggestions-list">
                <h5 class="meta-label" style="font-size: 0.7rem; margin-bottom: 1rem;">Bullet Point Optimizations</h5>
                ${data.suggestions.map(s => `
                    <div class="suggestion-item">
                        <div class="suggestion-original">"${sanitizeHTML(s.original)}"</div>
                        <div class="suggestion-new">"${sanitizeHTML(s.suggested)}"</div>
                        <div class="suggestion-reason">Why: ${sanitizeHTML(s.reason)}</div>
                    </div>
                `).join('')}
            </div>
            <div class="missing-keywords">
                <h5 class="meta-label" style="font-size: 0.7rem; margin-top: 1.5rem; margin-bottom: 0.5rem;">Recommended Keywords</h5>
                <div class="keyword-list">
                    ${data.missingKeywords.map(k => `<span class="keyword-tag">${sanitizeHTML(k)}</span>`).join('')}
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        btn.innerHTML = 'Tailoring Complete';
        btn.style.background = 'var(--success)';
        btn.style.borderColor = 'var(--success)';
    } catch (error) {
        console.error(error);
        container.innerHTML = `
            <div class="loading-state" style="color: #ef4444;">
                <p>Error: ${sanitizeHTML(error.message)}</p>
                <p style="font-size: 0.8rem; margin-top: 0.5rem; opacity: 0.7;">Make sure GEMINI_API_KEY is set in .env</p>
            </div>
        `;
        btn.disabled = false;
        btn.innerHTML = 'Retry Tailoring';
    }
}

async function renderProfiles() {
    const list = document.getElementById('profiles-list');
    if (!list) return;

    list.innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';

    try {
        const response = await fetch('/api/v1/internal/profiles', {
            headers: { 'x-internal-session': SESSION_TOKEN }
        });
        const profiles = await response.json();

        list.innerHTML = '';
        if (profiles.length === 0) {
            list.innerHTML = '<div class="text-dim">No specialized profiles found. Upload a CV to get started.</div>';
            return;
        }

        profiles.forEach(p => {
            const card = document.createElement('div');
            card.className = 'stat-card-glass';
            card.style.alignItems = 'flex-start';
            card.style.textAlign = 'left';
            card.style.padding = '1.5rem';

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; width: 100%; margin-bottom: 1rem;">
                    <h4 style="margin: 0; color: var(--text-main);">${sanitizeHTML(p.name)}</h4>
                    ${p.isDefault ? '<span class="status-badge status-applied">Default</span>' : ''}
                </div>
                <div style="margin-bottom: 1rem; font-size: 0.8rem; color: var(--text-muted);">
                    <strong>Experience:</strong> ${p.experience} Years
                </div>
                <div class="keyword-list" style="margin-bottom: 1.5rem;">
                    ${p.skills.slice(0, 5).map(s => `<span class="keyword-tag">${sanitizeHTML(s)}</span>`).join('')}
                </div>
                <div style="display: flex; gap: 0.5rem; width: 100%;">
                    <button onclick="setDefaultProfile(${p.id})" class="btn btn-sidebar" style="flex: 1; font-size: 0.7rem; justify-content: center;">Set Primary</button>
                    <button onclick="deleteProfile(${p.id})" class="btn btn-secondary" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.2); flex: 0.5; font-size: 0.7rem; justify-content: center;">Delete</button>
                </div>
            `;
            list.appendChild(card);
        });
    } catch (e) {
        list.innerHTML = '<p class="error">Failed to load profiles.</p>';
    }
}

async function uploadProfile(e) {
    e.preventDefault();
    const btn = document.getElementById('save-profile-btn');
    const nameInput = document.getElementById('profile-name');
    const fileInput = document.getElementById('profile-cv');
    
    if (!nameInput.value || !fileInput.files[0]) {
        alert('Please provide a name and select a CV file.');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Analyzing CV...';

    const formData = new FormData();
    formData.append('name', nameInput.value);
    formData.append('cv', fileInput.files[0]);

    try {
        const response = await fetch('/api/v1/internal/profiles', {
            method: 'POST',
            headers: { 'x-internal-session': SESSION_TOKEN },
            body: formData
        });

        if (response.ok) {
            nameInput.value = '';
            fileInput.value = '';
            renderProfiles();
        } else {
            const err = await response.json();
            alert('Upload failed: ' + err.error);
        }
    } catch (e) {
        alert('Error uploading profile.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Initialize Profile';
    }
}

async function setDefaultProfile(id) {
    await fetch(`/api/v1/internal/profiles/${id}/default`, {
        method: 'PATCH',
        headers: { 'x-internal-session': SESSION_TOKEN }
    });
    renderProfiles();
}

async function deleteProfile(id) {
    if (confirm('Are you sure? This profile and its associated match history will be removed.')) {
        await fetch(`/api/v1/internal/profiles/${id}`, {
            method: 'DELETE',
            headers: { 'x-internal-session': SESSION_TOKEN }
        });
        renderProfiles();
    }
}

async function renderAnalytics() {
    const funnelChart = document.getElementById('funnel-chart');
    const sourceChart = document.getElementById('source-chart');
    if (!funnelChart || !sourceChart) return;

    funnelChart.innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';
    sourceChart.innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';

    try {
        const response = await fetch('/api/v1/internal/analytics/summary', {
            headers: { 'x-internal-session': SESSION_TOKEN }
        });
        const data = await response.json();

        // Update Stat Cards
        document.getElementById('stat-total').textContent = data.total;
        
        const conversion = data.total > 0 ? Math.round((data.byStatus.applied / data.total) * 100) : 0;
        document.getElementById('stat-conversion').textContent = `${conversion}%`;
        
        const avgScore = allJobs.length > 0 ? Math.round(allJobs.reduce((acc, j) => acc + (j.score || 0), 0) / allJobs.length) : 0;
        document.getElementById('stat-avg-score').textContent = `${avgScore}%`;

        // Render Funnel
        const statuses = ['discovered', 'applied', 'interviewing', 'offered'];
        const labels = ['Discovered', 'Applied', 'Interviewing', 'Offers'];
        let funnelHtml = '';
        statuses.forEach((status, i) => {
            const count = data.byStatus[status] || 0;
            const percentage = data.total > 0 ? (count / data.total) * 100 : 0;
            funnelHtml += `
                <div class="funnel-step">
                    <div class="funnel-label">${labels[i]}</div>
                    <div class="funnel-bar-wrapper">
                        <div class="funnel-bar" style="width: ${percentage}%"></div>
                    </div>
                    <div class="funnel-count">${count}</div>
                </div>
            `;
        });
        funnelChart.innerHTML = funnelHtml;

        // Render Source Distribution
        let sourceHtml = '';
        const sources = Object.entries(data.bySource).sort((a, b) => b[1] - a[1]);
        const maxSourceCount = Math.max(...Object.values(data.bySource), 1);

        sources.forEach(([source, count]) => {
            const percentage = (count / maxSourceCount) * 100;
            sourceHtml += `
                <div class="bar-item">
                    <div class="bar-label-row">
                        <span>${sanitizeHTML(source)}</span>
                        <span>${count}</span>
                    </div>
                    <div class="bar-wrapper">
                        <div class="bar-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        });
        sourceChart.innerHTML = sourceHtml;

    } catch (error) {
        console.error('Failed to render analytics:', error);
        funnelChart.innerHTML = '<p class="error">Failed to load analytics data.</p>';
    }
}

function renderTableView() {
    const tableBody = document.getElementById('table-body');
    if (!tableBody) return;

    // Use current allJobs filtered by any global filters if necessary, 
    // but for now we show everything in the table for bulk analysis
    const jobs = [...allJobs].sort((a, b) => (b.score || 0) - (a.score || 0));

    tableBody.innerHTML = '';
    jobs.forEach(job => {
        const row = document.createElement('tr');
        row.onclick = () => openModal(job);

        const dateStr = job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A';
        const status = job.status || 'discovered';
        
        let skills = [];
        try {
            skills = Array.isArray(job.matchedSkills) ? job.matchedSkills : JSON.parse(job.matchedSkills || '[]');
        } catch(e) {
            skills = job.matchedSkills ? (typeof job.matchedSkills === 'string' ? job.matchedSkills.split(',') : []) : [];
        }
        const skillsStr = skills.join(', ');

        row.innerHTML = `
            <td>${sanitizeHTML(job.jobTitle)}</td>
            <td>${sanitizeHTML(job.company)}</td>
            <td class="score-cell ${job.score > 75 ? 'high' : ''}">${job.score}%</td>
            <td class="status-cell status-${status}">${status}</td>
            <td>${sanitizeHTML(job.location || 'Remote')}</td>
            <td>${job.contactEmail ? `<a href="mailto:${sanitizeHTML(job.contactEmail)}" onclick="event.stopPropagation()">${sanitizeHTML(job.contactEmail)}</a>` : '<span class="text-dim">—</span>'}</td>
            <td>${job.companyUrl ? `<a href="${sanitizeHTML(job.companyUrl)}" target="_blank" onclick="event.stopPropagation()">${sanitizeHTML(new URL(job.companyUrl).hostname)}</a>` : '<span class="text-dim">—</span>'}</td>
            <td title="${sanitizeHTML(skillsStr)}">${sanitizeHTML(skillsStr.substring(0, 30))}${skillsStr.length > 30 ? '...' : ''}</td>
            <td>${sanitizeHTML(job.source || 'Scraped')}</td>
            <td>${dateStr}</td>
        `;
        tableBody.appendChild(row);
    });
}

function downloadCSV() {
    const jobs = allJobs;
    if (jobs.length === 0) return;

    const headers = ['jobTitle', 'company', 'score', 'status', 'location', 'contactEmail', 'companyUrl', 'matchedSkills', 'source', 'url', 'createdAt'];
    const csvRows = [];
    
    // Add header row
    csvRows.push(headers.join(','));

    // Add data rows
    jobs.forEach(job => {
        const values = headers.map(header => {
            let val = job[header] || '';
            if (header === 'matchedSkills' && Array.isArray(val)) {
                val = val.join(', ');
            }
            const escaped = ('' + val).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `job_discoveries_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function filterAndRenderJobs() {
    if (currentView !== 'discovery') return;

    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const activeFilterBtn = document.querySelector('.btn-sidebar.active');
    const activeFilter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';
    const sortSelect = document.getElementById('sort-select');
    const sortVal = sortSelect ? sortSelect.value : 'score-desc';

    let filtered = allJobs.filter(job => {
        // Only show 'discovered' jobs in the discovery feed
        if (job.status && job.status !== 'discovered') return false;

        const title = (job.jobTitle || '').toLowerCase();
        const comp = (job.company || '').toLowerCase();
        const skillsStr = (job.matchedSkills || '').toString().toLowerCase();

        const matchesSearch = 
            title.includes(searchTerm) || 
            comp.includes(searchTerm) ||
            skillsStr.includes(searchTerm);
        
        let matchesCategory = true;
        if (activeFilter === 'high-score') {
            matchesCategory = job.score > 75;
        } else if (activeFilter === 'recent') {
            const daysAgo = (new Date() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24);
            matchesCategory = daysAgo <= 2;
        } else if (activeFilter === 'mobile') {
            const desc = (job.description || '').toLowerCase();
            matchesCategory = title.includes('flutter') || 
                              title.includes('mobile') || 
                              title.includes('ios') || 
                              title.includes('android') ||
                              desc.includes('flutter') ||
                              desc.includes('dart');
        }

        return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
        switch (sortVal) {
            case 'score-desc': return b.score - a.score;
            case 'score-asc': return a.score - b.score;
            case 'date-desc': return new Date(b.createdAt) - new Date(a.createdAt);
            case 'title-asc': return (a.jobTitle || '').localeCompare(b.jobTitle || '');
            default: return 0;
        }
    });

    renderJobs(filtered);
}

function renderTracker() {
    const statuses = ['discovered', 'applied', 'interviewing', 'offered'];
    
    statuses.forEach(status => {
        const column = document.getElementById(`col-${status}`);
        if (!column) return;

        const countBadge = column.parentElement.querySelector('.column-count');
        const jobs = allJobs.filter(j => (j.status || 'discovered') === status);
        
        if (countBadge) countBadge.textContent = jobs.length;
        column.innerHTML = '';

        if (jobs.length === 0) {
            column.innerHTML = `<div class="text-dim" style="text-align: center; padding: 2rem; font-size: 0.8rem;">No jobs in this stage</div>`;
        } else {
            jobs.forEach(job => {
                const card = document.createElement('div');
                card.className = 'kanban-card';
                card.onclick = () => openModal(job);
                
                const dateStr = job.updatedAt ? new Date(job.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently';

                card.innerHTML = `
                    <h4 class="job-title" style="font-size: 0.95rem; margin-bottom: 0.25rem;">${sanitizeHTML(job.jobTitle)}</h4>
                    <p class="job-company" style="font-size: 0.8rem; opacity: 0.7; margin-bottom: 0.75rem;">${sanitizeHTML(job.company)}</p>
                    <div class="job-score ${job.score > 75 ? 'high-match' : (job.score < 40 ? 'medium' : '')}" style="font-size: 0.7rem; padding: 0.2rem 0.5rem; align-self: flex-start;">${job.score}% Match</div>
                    <div class="card-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem; font-size: 0.7rem; opacity: 0.5;">
                        <span>${sanitizeHTML(job.source || 'Scraped')}</span>
                        <span>${dateStr}</span>
                    </div>
                `;
                column.appendChild(card);
            });
        }
    });
}

async function updateJobStatus(id, newStatus) {
    try {
        const response = await fetch(`/api/v1/internal/discovery/jobs/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-session': SESSION_TOKEN
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            // Update local state
            const jobIndex = allJobs.findIndex(j => j.id === id);
            if (jobIndex !== -1) {
                allJobs[jobIndex].status = newStatus;
                allJobs[jobIndex].updatedAt = new Date().toISOString();
            }
            
            if (currentView === 'discovery') {
                filterAndRenderJobs();
            } else {
                renderTracker();
            }
            return true;
        } else {
            const err = await response.json();
            alert('Error: ' + (err.error || 'Failed to update status'));
            return false;
        }
    } catch (error) {
        console.error('Failed to update status:', error);
        alert('Failed to update status. Check connection.');
        return false;
    }
}

function renderJobs(jobs) {
    const grid = document.getElementById('job-grid');
    grid.innerHTML = '';

    if (jobs.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3>No matches found</h3>
                <p>Try adjusting your filters or search terms to discover more opportunities.</p>
            </div>
        `;
        return;
    }

    const countContainer = document.getElementById('results-count-container');
    if (countContainer) {
        countContainer.innerHTML = `<div class="results-count">Showing ${jobs.length} identified opportunities</div>`;
    }

    jobs.forEach((job, index) => {
        const card = document.createElement('div');
        card.className = 'job-card';
        card.style.animationDelay = `${index * 0.05}s`;
        card.onclick = () => openModal(job);

        let scoreClass = '';
        if (job.score > 75) scoreClass = 'high-match';
        else if (job.score < 40) scoreClass = 'medium';
        
        let skills = [];
        try {
            skills = Array.isArray(job.matchedSkills) ? job.matchedSkills : JSON.parse(job.matchedSkills || '[]');
        } catch(e) {
            skills = job.matchedSkills ? (typeof job.matchedSkills === 'string' ? job.matchedSkills.split(',') : []) : [];
        }

        const skillsHtml = skills && skills.length > 0 
            ? `<div class="job-skills">${skills.slice(0, 5).map(s => `<span class="skill-tag">${sanitizeHTML(s)}</span>`).join('')}${skills.length > 5 ? `<span class="skill-tag">+${skills.length - 5}</span>` : ''}</div>`
            : '';

        const dateStr = job.createdAt ? new Date(job.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently';

        card.innerHTML = `
            <div class="job-header">
                <div>
                    <h3 class="job-title">${sanitizeHTML(job.jobTitle)}</h3>
                    <div class="job-company">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        ${sanitizeHTML(job.company)}
                    </div>
                </div>
                <div class="job-score ${scoreClass}" title="AI Match Score based on your profile">${job.score}% Match</div>
            </div>
            
            <div class="job-meta">
                <span>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    ${sanitizeHTML(job.location || 'Remote')}
                </span>
                <span>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    ${dateStr}
                </span>
            </div>

            ${skillsHtml}

            <div class="job-action">
                <button class="apply-btn">View Intelligence Report</button>
            </div>
        `;

        grid.appendChild(card);
    });
}

async function generateInterviewPrep(jobId) {
    const btn = document.getElementById('prep-btn');
    const section = document.getElementById('prep-section');
    const container = document.getElementById('prep-results');

    if (!btn || !section || !container) return;

    try {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner" style="width: 14px; height: 14px; margin: 0; display: inline-block;"></span> Designing Prep Guide...';
        section.style.display = 'block';
        container.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>AI is generating tailored technical and behavioral questions...</p></div>';
        
        section.scrollIntoView({ behavior: 'smooth' });

        const response = await fetch(`/api/v1/internal/discovery/jobs/${jobId}/prep`, {
            method: 'POST',
            headers: {
                'x-internal-session': SESSION_TOKEN
            }
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to generate prep guide');
        }

        const data = await response.json();
        
        let html = `
            <div class="tailor-summary" style="border-color: var(--primary-glow);">${sanitizeHTML(data.summary)}</div>
            
            <div style="margin-bottom: 2rem;">
                <h5 class="meta-label" style="font-size: 0.7rem; margin-bottom: 1rem;">Company Key Focus Areas</h5>
                <div class="keyword-list">
                    ${data.focusAreas.map(f => `<span class="focus-area-tag">${sanitizeHTML(f)}</span>`).join('')}
                </div>
            </div>

            <div class="prep-grid">
                <div class="prep-card">
                    <h6>Technical Prep</h6>
                    ${data.technicalQuestions.map(q => `
                        <div class="question-item">
                            <div class="question-text">${sanitizeHTML(q.question)}</div>
                            <div class="question-context">${sanitizeHTML(q.context)}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="prep-card">
                    <h6>Behavioral Prep</h6>
                    ${data.behavioralQuestions.map(q => `
                        <div class="question-item">
                            <div class="question-text">${sanitizeHTML(q.question)}</div>
                            <div class="question-context">${sanitizeHTML(q.context)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        btn.innerHTML = 'Prep Guide Ready';
        btn.style.background = 'var(--primary)';
        btn.style.borderColor = 'var(--primary)';
    } catch (error) {
        console.error(error);
        container.innerHTML = `
            <div class="loading-state" style="color: #ef4444;">
                <p>Error: ${sanitizeHTML(error.message)}</p>
                <p style="font-size: 0.8rem; margin-top: 0.5rem; opacity: 0.7;">Ensure GEMINI_API_KEY is active.</p>
            </div>
        `;
        btn.disabled = false;
        btn.innerHTML = 'Retry Prep Guide';
    }
}

async function draftEmail(jobId) {
    const btn = document.getElementById('draft-btn');
    const section = document.getElementById('draft-section');
    const container = document.getElementById('draft-results');

    if (!btn || !section || !container) return;

    try {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner" style="width: 14px; height: 14px; margin: 0; display: inline-block;"></span> Drafting Email...';
        section.style.display = 'block';
        container.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>AI is drafting a personalized outreach email...</p></div>';
        
        section.scrollIntoView({ behavior: 'smooth' });

        const response = await fetch(`/api/v1/internal/discovery/jobs/${jobId}/draft-email`, {
            method: 'POST',
            headers: {
                'x-internal-session': SESSION_TOKEN
            }
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to generate draft');
        }

        const data = await response.json();
        
        // Find the job to get the email (if any)
        const job = allJobs.find(j => j.id === jobId);
        const contactEmail = job && job.contactEmail ? job.contactEmail : '';
        const mailtoLink = contactEmail ? `mailto:${contactEmail}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(data.body)}` : null;

        let html = `
            <div class="draft-subject">Subject: ${sanitizeHTML(data.subject)}</div>
            <div class="draft-body" id="draft-body-text">${sanitizeHTML(data.body)}</div>
            <div class="draft-actions">
                <button onclick="copyToClipboard(document.getElementById('draft-body-text').innerText, this)" class="action-btn btn-secondary">
                    <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy Text
                </button>
                ${mailtoLink ? `
                <a href="${mailtoLink}" class="action-btn" style="background: var(--success); color: white; text-decoration: none;">
                    <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    Open in Mail
                </a>` : ''}
            </div>
        `;
        
        container.innerHTML = html;
        btn.innerHTML = 'Draft Ready';
        btn.style.background = 'var(--success)';
        btn.style.borderColor = 'var(--success)';
    } catch (error) {
        console.error(error);
        container.innerHTML = `
            <div class="loading-state" style="color: #ef4444;">
                <p>Error: ${sanitizeHTML(error.message)}</p>
                <p style="font-size: 0.8rem; margin-top: 0.5rem; opacity: 0.7;">Ensure GEMINI_API_KEY is active.</p>
            </div>
        `;
        btn.disabled = false;
        btn.innerHTML = 'Retry Draft';
    }
}

function openModal(job) {
    const modal = document.getElementById('job-modal');
    const modalBody = document.getElementById('modal-body');
    
    const dateStr = job.createdAt ? new Date(job.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently discovered';
    
    const contactInfo = job.contactEmail ? `
        <div class="contact-email-container">
            <a href="mailto:${sanitizeHTML(job.contactEmail)}" class="email-link">${sanitizeHTML(job.contactEmail)}</a>
            <button class="copy-btn" onclick="copyToClipboard('${sanitizeHTML(job.contactEmail)}', this)" title="Copy Email">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            </button>
        </div>
    ` : '<span class="text-dim">No direct email detected</span>';

    const statusLabel = (job.status || 'discovered').charAt(0).toUpperCase() + (job.status || 'discovered').slice(1);

    let actionButtons = '';
    const currentStatus = job.status || 'discovered';

    if (currentStatus === 'discovered') {
        actionButtons = `
            <button onclick="handleStatusChange(${job.id}, 'applied')" class="action-btn apply-btn" style="flex: 2;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Mark as Applied
            </button>
        `;
    } else if (currentStatus === 'applied') {
        actionButtons = `
            <button onclick="handleStatusChange(${job.id}, 'interviewing')" class="action-btn apply-btn" style="flex: 1;">Start Interviewing</button>
            <button onclick="handleStatusChange(${job.id}, 'offered')" class="action-btn btn-secondary" style="flex: 1;">Got Offer!</button>
        `;
    } else if (currentStatus === 'interviewing') {
        actionButtons = `
            <button onclick="handleStatusChange(${job.id}, 'offered')" class="action-btn apply-btn" style="flex: 1;">Got Offer!</button>
            <button onclick="handleStatusChange(${job.id}, 'discovered')" class="action-btn btn-secondary" style="flex: 1;">Reset to Discovered</button>
        `;
    } else {
        actionButtons = `
            <button onclick="handleStatusChange(${job.id}, 'discovered')" class="action-btn btn-secondary" style="flex: 1;">Reset to Discovered</button>
        `;
    }

    modalBody.innerHTML = `
        <div class="modal-header">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1rem;">
                <h2 class="modal-title">${sanitizeHTML(job.jobTitle)}</h2>
                <span class="status-badge status-${currentStatus}">${statusLabel}</span>
            </div>
            <div class="modal-subtitle">
                <span>${sanitizeHTML(job.company)}</span>
                <span class="dot"></span>
                <span>${sanitizeHTML(job.location || 'Remote')}</span>
                <span class="job-score ${job.score > 75 ? 'high-match' : (job.score < 40 ? 'medium' : '')}">${job.score}% Match</span>
            </div>
        </div>

        <div class="modal-meta-grid">
            <div class="meta-item">
                <span class="meta-label">Discovery Source</span>
                <span class="meta-value">${sanitizeHTML(job.source || 'Autonomous Agent')}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Analysis Date</span>
                <span class="meta-value">${dateStr}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Company Asset</span>
                <span class="meta-value">
                    ${job.companyUrl ? `<a href="${sanitizeHTML(job.companyUrl)}" target="_blank">${sanitizeHTML(new URL(job.companyUrl).hostname)}</a>` : '<span class="text-dim">Not verified</span>'}
                </span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Direct Reachout</span>
                <span class="meta-value" id="modalEmail">${contactInfo}</span>
            </div>
        </div>

        <div class="jd-section">
            <h4 class="meta-label" style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Deep Intelligence Analysis
            </h4>
            <div class="jd-container">
                ${formatDescription(job.jobDescription)}
            </div>
        </div>

        <div id="tailor-section" class="tailor-section" style="display: none; margin-top: 2rem;">
            <h4 class="meta-label" style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; color: var(--secondary);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                AI Resume Tailoring Suggestions
            </h4>
            <div id="tailor-results" class="tailor-container">
                <!-- Injected via JS -->
            </div>
        </div>

        <div id="prep-section" class="prep-section" style="display: none; margin-top: 2rem;">
            <h4 class="meta-label" style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; color: var(--primary-light);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                AI Interview Preparation Guide
            </h4>
            <div id="prep-results" class="prep-container">
                <!-- Injected via JS -->
            </div>
        </div>

        <div id="draft-section" class="draft-section" style="display: none; margin-top: 2rem;">
            <h4 class="meta-label" style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; color: var(--success);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                AI Outreach Email Draft
            </h4>
            <div id="draft-results" class="draft-container">
                <!-- Injected via JS -->
            </div>
        </div>

        <div style="margin-top: 3rem; display: flex; flex-direction: column; gap: 1rem;">
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                ${actionButtons}
                <button id="tailor-btn" onclick="tailorResume(${job.id})" class="action-btn btn-secondary" style="flex: 1; border-color: var(--secondary-glow); color: var(--secondary); min-width: 180px;">
                    <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    Tailor Resume
                </button>
                <button id="prep-btn" onclick="generateInterviewPrep(${job.id})" class="action-btn btn-secondary" style="flex: 1; border-color: var(--primary-glow); color: var(--primary-light); min-width: 180px;">
                    <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Interview Prep
                </button>
                <button id="draft-btn" onclick="draftEmail(${job.id})" class="action-btn btn-secondary" style="flex: 1; border-color: rgba(16, 185, 129, 0.4); color: var(--success); min-width: 180px;">
                    <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    Draft Outreach
                </button>
            </div>
            <a href="${sanitizeHTML(job.url)}" target="_blank" class="action-btn btn-secondary" style="text-decoration: none;">View Original Listing</a>
        </div>
    `;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    const closeBtn = document.querySelector('.modal-close');
    if (closeBtn) closeBtn.onclick = closeModal;

    window.onclick = (event) => {
        if (event.target == modal) {
            closeModal();
        }
    };
}

// Global handler for status change from modal
window.handleStatusChange = async (id, status) => {
    const success = await updateJobStatus(id, status);
    if (success) {
        closeModal();
    }
};

function closeModal() {
    const modal = document.getElementById('job-modal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function formatDescription(text) {
    if (!text) return '<p class="text-dim">Detailed behavioral analysis is being processed...</p>';

    var NL = '\n';
    var clean = sanitizeHTML(text);

    // Truncate markers
    var tailMarkers = [
        /\s*Show more\s*Show less.*/is,
        /\s*Seniority level.*/is,
        /\s*Similar jobs.*/is,
        /\s*Referrals increase your chances.*/is,
    ];
    for (var i = 0; i < tailMarkers.length; i++) {
        clean = clean.replace(tailMarkers[i], '');
    }

    clean = clean.replace(/\s{2,}/g, ' ').trim();

    var sectionKeywords = [
        ['About the job',        'Overview'],
        ['Responsibilities',     'Responsibilities'],
        ['Requirements',         'Requirements'],
        ['Qualifications',       'Qualifications'],
        ['Benefits',             'Benefits'],
    ];
    for (var k = 0; k < sectionKeywords.length; k++) {
        var re = new RegExp('\\s*' + sectionKeywords[k][0] + '\\s*:?', 'gi');
        clean = clean.replace(re, NL + '::SECTION::' + sectionKeywords[k][1] + NL);
    }

    var lines = clean.split(NL);
    var html = '';
    var inList = false;

    for (var m = 0; m < lines.length; m++) {
        var line = lines[m].trim();
        if (!line) continue;

        if (line.indexOf('::SECTION::') === 0) {
            if (inList) { html += '</ul>'; inList = false; }
            html += '<h5 class="section-title">' + line.replace('::SECTION::', '') + '</h5>';
        } else if (/^[•\-\*✔✓►▸▹➤➜]/.test(line)) {
            if (!inList) { html += '<ul class="description-list">'; inList = true; }
            html += '<li>' + line.replace(/^[•\-\*✔✓►▸▹➤➜]\s*/, '') + '</li>';
        } else {
            if (inList) { html += '</ul>'; inList = false; }
            html += '<p>' + line + '</p>';
        }
    }
    if (inList) html += '</ul>';

    return html || '<p class="text-dim">No description available.</p>';
}

function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const originalIcon = btn.innerHTML;
        btn.innerHTML = '<span class="copy-icon" style="color: #10b981;">✓</span>';
        setTimeout(() => {
            btn.innerHTML = originalIcon;
        }, 2000);
    });
}

