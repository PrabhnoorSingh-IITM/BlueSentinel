/**
 * forums.js
 * Handles Forums Page interactions and Firebase Realtime Updates
 */

document.addEventListener('DOMContentLoaded', function () {
    initForums();
});

function initForums() {
    const forumsList = document.querySelector('.forums-list');
    const form = document.getElementById('manual-entry-form');

    // 1. Listen for new posts (Read)
    const dbRef = window.firebaseDB ? window.firebaseDB.ref('forum_posts') : null;

    if (dbRef) {
        dbRef.limitToLast(20).on('child_added', (snapshot) => {
            const post = snapshot.val();
            const postKey = snapshot.key;
            renderPost(post, postKey, forumsList);
        });
    }

    // 2. Handle Form Submission (Write)
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;

            // Get inputs
            const temp = form.querySelector('input[placeholder*="24.5"]').value;
            const ph = form.querySelector('input[placeholder*="7.2"]').value;
            const notes = form.querySelector('textarea').value;

            btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Posting...';
            btn.disabled = true;

            const newPost = {
                type: 'Field Report',
                author: 'Community Member', // Anonymous for now
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                title: `Field Report: Temp ${temp}°C, pH ${ph}`,
                content: notes,
                data: { temp: temp, ph: ph },
                tags: ['Report']
            };

            if (dbRef) {
                dbRef.push(newPost).then(() => {
                    alert("Report Submitted Successfully!");
                    form.reset();
                    toggleReportForm(); // Close form (defined in HTML or need to redefine)
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }).catch(err => {
                    console.error(err);
                    alert("Error posting report.");
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                });
            } else {
                alert("Database connection failed.");
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }
}

/**
 * Renders a forum post card and prepends it to the list
 * (Note: prepend is tricky with child_added on load, but we want newest first)
 * Actually Firebase child_added comes in chronological order usually.
 * We want to display newest at top. So we should PREPEND.
 */
function renderPost(post, key, container) {
    // Check if element already exists (to prevent duplicates if re-rendering)
    if (document.getElementById(`post-${key}`)) return;

    const threadDiv = document.createElement('div');
    threadDiv.className = 'forum-thread';
    threadDiv.id = `post-${key}`;

    // Format Date
    const date = post.timestamp ? new Date(post.timestamp).toLocaleDateString() + ' ' + new Date(post.timestamp).toLocaleTimeString() : 'Just now';

    threadDiv.innerHTML = `
        <div class="thread-meta">
            <span class="thread-tag" style="background: rgba(84, 101, 255, 0.2); color: #5465FF;">${post.type || 'General'}</span>
            <span>• ${post.author} • ${date}</span>
        </div>
        <h3 style="color: white; margin-bottom: 0.5rem;">${post.title}</h3>
        <p style="color: var(--text-secondary); font-size: 0.95rem;">
            ${post.content}
        </p>
    `;

    // Insert after the Pinned Post (if exists) or at the top
    // The pinned post usually is the first child. Let's try to insert after it if class is 'pinned', 
    // or just prepend to the list if we treat pinned as just another post or hardcoded.
    // In forums.html, Pinned Thread is hardcoded. 
    // We want new real posts to appear below the Pinned one, but above older ones.

    // Strategy: The container has hardcoded posts. We might want to clear them or keep them.
    // Let's Insert AFTER the first element (Pinned)
    const firstChild = container.firstElementChild;
    if (firstChild) {
        container.insertBefore(threadDiv, firstChild.nextSibling);
    } else {
        container.appendChild(threadDiv);
    }

    threadDiv.style.animation = 'fadeInUp 0.5s ease';
}
