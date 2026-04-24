// Production Security: Use environment-driven session tokens if possible. 
// For this local engine, we use a constant that can be overridden by the server.
const SESSION_TOKEN = 'job-discovery-secure-2026'; 

let allJobs = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchJobs();

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', () => {
        filterAndRenderJobs();
    });

    const filterBtns = document.querySelectorAll('.filter-box .btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterAndRenderJobs();
        });
    });

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
        allJobs = await response.json();
        
        updateStats();
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

function filterAndRenderJobs() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const activeFilterBtn = document.querySelector('.filter-box .btn.active');
    const activeFilter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';
    const sortSelect = document.getElementById('sort-select');
    const sortVal = sortSelect ? sortSelect.value : 'score-desc';

    let filtered = allJobs.filter(job => {
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

    const countBadge = document.createElement('div');
    countBadge.className = 'results-count';
    countBadge.textContent = `Showing ${jobs.length} identified opportunities`;
    grid.appendChild(countBadge);

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

    modalBody.innerHTML = `
        <div class="modal-header">
            <h2 class="modal-title">${sanitizeHTML(job.jobTitle)}</h2>
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

        <div style="margin-top: 3rem; display: flex; gap: 1rem;">
            <a href="${sanitizeHTML(job.url)}" target="_blank" class="apply-btn" style="flex: 2;">View Original Listing</a>
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

