let allJobs = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchJobs();

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
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
});

async function fetchJobs() {
    try {
        const response = await fetch('/api/jobs');
        if (!response.ok) throw new Error('Failed to fetch jobs');
        allJobs = await response.json();
        
        document.getElementById('total-jobs').textContent = allJobs.length;
        filterAndRenderJobs();
    } catch (error) {
        console.error(error);
        document.getElementById('job-grid').innerHTML = `
            <div class="loading-state">
                <p style="color: #ef4444;">Error loading jobs. Ensure the server is running.</p>
            </div>
        `;
    }
}

function filterAndRenderJobs() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const activeFilter = document.querySelector('.filter-box .btn.active').dataset.filter;

    let filtered = allJobs.filter(job => {
        // Search filter
        const matchesSearch = 
            job.jobTitle.toLowerCase().includes(searchTerm) || 
            job.company.toLowerCase().includes(searchTerm) ||
            (job.matchedSkills && job.matchedSkills.join(' ').toLowerCase().includes(searchTerm));
        
        // Score filter
        const matchesScore = activeFilter === 'high-score' ? job.score > 60 : true;

        return matchesSearch && matchesScore;
    });

    renderJobs(filtered);
}

function renderJobs(jobs) {
    const grid = document.getElementById('job-grid');
    grid.innerHTML = '';

    if (jobs.length === 0) {
        grid.innerHTML = `
            <div class="loading-state">
                <p>No jobs found matching your criteria.</p>
            </div>
        `;
        return;
    }

    jobs.forEach((job, index) => {
        const card = document.createElement('div');
        card.className = 'job-card';
        card.style.animationDelay = `${index * 0.05}s`;

        let scoreClass = job.score > 60 ? '' : 'medium';
        
        // Try parsing skills if they are stored as JSON string
        let skills = [];
        try {
            skills = typeof job.matchedSkills === 'string' ? JSON.parse(job.matchedSkills) : job.matchedSkills;
        } catch(e) {
            skills = job.matchedSkills ? job.matchedSkills.split(',') : [];
        }

        const skillsHtml = skills && skills.length > 0 
            ? `<div class="job-skills">${skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div>`
            : '';

        const dateStr = new Date(job.dateScraped).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

        card.innerHTML = `
            <div class="job-header">
                <div>
                    <h3 class="job-title">${job.jobTitle}</h3>
                    <div class="job-company">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        ${job.company}
                    </div>
                </div>
                <div class="job-score ${scoreClass}">${job.score} Match</div>
            </div>
            
            <div class="job-meta">
                <span>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    ${job.location}
                </span>
                <span>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    ${dateStr}
                </span>
            </div>

            ${skillsHtml}

            <div class="job-action">
                <a href="${job.jobUrl}" target="_blank" rel="noopener noreferrer" class="apply-btn">View Job</a>
            </div>
        `;

        grid.appendChild(card);
    });
}
