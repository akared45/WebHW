const username = "akared45";
    const repo = "MVC";
    const branch = "main";

    const repoNameEl = document.getElementById('repoName');
    const repoDescEl = document.getElementById('repoDesc');
    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    const overlay = document.getElementById('overlay');
    const sidebar = document.getElementById('sidebar');
    const filePathEl = document.getElementById('filePath');

    repoNameEl.textContent = `📦 ${username}/${repo}`;

    toggleSidebarBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    });

    async function loadRepoInfo() {
      try {
        const url = `https://api.github.com/repos/${username}/${repo}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.description) {
          repoDescEl.textContent = data.description;
        }
      } catch (error) {
        console.error('Failed to load repository info:', error);
      }
    }

    async function loadFolder(path, parentElement, isRoot = false) {
      if (isRoot) {
        parentElement.innerHTML = '<li><span class="loading"></span>Loading...</li>';
      }

      try {
        const url = `https://api.github.com/repos/${username}/${repo}/contents/${path}?ref=${branch}`;
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const items = await res.json();

        if (isRoot) {
          parentElement.innerHTML = '';
        } else {
          while (parentElement.children.length > 1) {
            parentElement.removeChild(parentElement.lastChild);
          }
        }

        const ul = document.createElement('ul');

        items.sort((a, b) => {
          if (a.type === b.type) {
            return a.name.localeCompare(b.name);
          }
          return a.type === 'dir' ? -1 : 1;
        });

        items.forEach(item => {
          const li = document.createElement('li');

          if (item.type === 'dir') {
            li.innerHTML = `<span class="folder-icon">📁</span> ${item.name}`;
            li.classList.add('folder');

            const nestedUl = document.createElement('ul');
            nestedUl.style.display = 'none';

            li.appendChild(nestedUl);
            li.addEventListener('click', (e) => {
              e.stopPropagation();
              li.classList.toggle('open');

              if (li.classList.contains('open')) {
                nestedUl.style.display = 'block';
                if (nestedUl.children.length === 0) {
                  loadFolder(item.path, li);
                }
              } else {
                nestedUl.style.display = 'none';
              }
            });
          } else if (item.type === 'file') {
            if (isSupportedFile(item.name)) {
              li.innerHTML = `<span>📄</span> ${item.name}`;
              li.classList.add('file');
              li.addEventListener('click', () => loadFile(item.path, item.name));
            } else {
              return;
            }
          }

          ul.appendChild(li);
        });

        if (isRoot) {
          parentElement.appendChild(ul);
        } else {
          parentElement.querySelector('ul').style.display = 'block';
          parentElement.appendChild(ul);
        }
      } catch (error) {
        console.error('Failed to load folder:', error);
        if (isRoot) {
          parentElement.innerHTML = `<li style="color: #f85149;">Error loading repository: ${error.message}</li>`;
        }
      }
    }

    function isSupportedFile(filename) {
      const supportedExtensions = ['.js', '.py', '.html', '.css', '.java', '.c', '.cpp', '.php', '.rb', '.go', '.rs', '.ts', '.json', '.xml', '.md', '.txt'];
      return supportedExtensions.some(ext => filename.endsWith(ext));
    }

    async function loadFile(path, filename) {
      const box = document.getElementById('codeBox');
      box.innerHTML = '<div class="empty-state"><span class="loading"></span>Loading file...</div>';
      box.className = '';

      filePathEl.innerHTML = `<span>📄</span> ${path}`;

      if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
      }

      try {
        const rawUrl = `https://raw.githubusercontent.com/${username}/${repo}/${branch}/${path}`;
        const res = await fetch(rawUrl);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const code = await res.text();

        if (path.endsWith('.py')) box.className = 'language-python';
        else if (path.endsWith('.js')) box.className = 'language-javascript';
        else if (path.endsWith('.html')) box.className = 'language-html';
        else if (path.endsWith('.css')) box.className = 'language-css';
        else if (path.endsWith('.java')) box.className = 'language-java';
        else if (path.endsWith('.c') || path.endsWith('.cpp')) box.className = 'language-cpp';
        else if (path.endsWith('.php')) box.className = 'language-php';
        else if (path.endsWith('.rb')) box.className = 'language-ruby';
        else if (path.endsWith('.go')) box.className = 'language-go';
        else if (path.endsWith('.rs')) box.className = 'language-rust';
        else if (path.endsWith('.ts')) box.className = 'language-typescript';
        else if (path.endsWith('.json')) box.className = 'language-json';
        else if (path.endsWith('.xml')) box.className = 'language-xml';
        else if (path.endsWith('.md')) box.className = 'language-markdown';
        else box.className = '';

        box.textContent = code;
        hljs.highlightElement(box);
      } catch (error) {
        console.error('Failed to load file:', error);
        box.innerHTML = `<div class="empty-state" style="color: #f85149;">
      <i>❌</i>
      <p>Error loading file: ${error.message}</p>
    </div>`;
      }
    }

    loadRepoInfo();
    loadFolder('', document.getElementById('fileTree'), true);