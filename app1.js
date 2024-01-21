const apiUrl = 'https://api.github.com/users/Rich-Harris/repos';
let currentPage = 1;
let perPage = 12;
let searchQuery = '';

async function fetchRepositories() {
    const repositoriesContainer = document.getElementById('repositories');
    const paginationContainer = document.getElementById('pagination');

    repositoriesContainer.innerHTML = ''; // Clear previous results
    paginationContainer.innerHTML = '';

    const loader = document.createElement('div');
    loader.classList.add('loader');
    paginationContainer.appendChild(loader);

    try {
        const response = await fetch(`${apiUrl}?per_page=${perPage}&page=${currentPage}`);
        const repositories = await response.json();

        // Display repositories
        repositories.forEach(async repo => {
            const repoElement = document.createElement('div');
            repoElement.classList.add('repository');

            const repoName = document.createElement('h3');
            repoName.textContent = repo.name;

            const repoDescription = document.createElement('p');
            repoDescription.textContent = repo.description || 'No description available.';

            const repoTopics = document.createElement('p');
            repoTopics.textContent = `Topics: ${repo.topics.join(', ') || 'No topics available.'}`;

            const repoLanguages = document.createElement('p');
            repoLanguages.textContent = 'Languages:';

            const languagesContainer = document.createElement('div');
            languagesContainer.classList.add('languages-container');

            // Fetch languages for the current repo
            const languagesUrl = repo.languages_url;
            const languagesResponse = await fetch(languagesUrl);
            const languagesData = await languagesResponse.json();

            // Display languages
            Object.keys(languagesData).forEach(lang => {
                const langElement = document.createElement('span');
                langElement.textContent = `${lang}: ${languagesData[lang]}`;
                languagesContainer.appendChild(langElement);
            });

            const repoLink = document.createElement('a');
            repoLink.href = repo.html_url;
            repoLink.textContent = 'View on GitHub';

            repoElement.appendChild(repoName);
            repoElement.appendChild(repoDescription);
            repoElement.appendChild(repoTopics);
            repoElement.appendChild(repoLanguages);
            repoElement.appendChild(languagesContainer);
            repoElement.appendChild(repoLink);

            repositoriesContainer.appendChild(repoElement);
        });

        // Display pagination
        const linkHeader = response.headers.get('Link');
        if (linkHeader) {
            const links = parseLinkHeader(linkHeader);
            for (let i = 1; i <= links.last.page; i++) {
                const pageButton = document.createElement('button');
                pageButton.textContent = i;
                pageButton.onclick = () => {
                    currentPage = i;
                    fetchRepositories();
                };
                paginationContainer.appendChild(pageButton);
            }
        }

    } catch (error) {
        console.error('Error fetching repositories:', error);
    } finally {
        // Remove loader after API call
        paginationContainer.removeChild(loader);
    }
}

function parseLinkHeader(header) {
    const links = {};
    header.split(',').forEach(part => {
        const section = part.split(';');
        if (section.length !== 2) return;
        const url = section[0].replace(/<(.*)>/, '$1').trim();
        const name = section[1].replace(/rel="(.*)"/, '$1').trim();
        links[name] = {
            url: url,
            page: parseInt(url.match(/page=(\d+).*$/)[1])
        };
    });
    return links;
}

// Fetch and display repositories on page load
fetchRepositories();

function handleImageUpload(input) {
    const profileImage = document.getElementById('avatarImage');
    const imageInput = document.getElementById('imageInput');

    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            // Update the profile image source
            profileImage.src = e.target.result;

            // Hide the upload button after successful upload
            imageInput.style.display = 'none';
        };

        reader.readAsDataURL(input.files[0]);
    }
}
// Get the DOM elements
const usernameInput = document.getElementById("username");
const searchBtn = document.getElementById("search-btn");
const repoList = document.getElementById("repo-list");
const pagination = document.getElementById("pagination");
const loader = document.getElementById("loader");

// Define some global variables
// let username = ""; // The GitHub username to search
// let page = 1; // The current page number
// let perPage = 10; // The number of repositories per page
// let total = 0; // The total number of repositories

// Add an event listener to the search button
searchBtn.addEventListener("click", function() {
    // Get the username from the input field
    username = usernameInput.value.trim();

    // Validate the username
    if (username === "") {
        alert("Please enter a GitHub username");
        return;
    }

    // Reset the page number and the repo list
    page = 1;
    repoList.innerHTML = "";

    // Fetch the repository data
    fetchRepos();
});

// Define a function to fetch the repository data
function fetchRepos() {
    // Show the loader
    loader.style.display = "block";

    // Make a request to the server-side script
    fetch(`fetch_repos.php?username=${username}&page=${page}&per_page=${perPage}`)
        .then(response => response.json()) // Parse the JSON data
        .then(data => {
            // Hide the loader
            loader.style.display = "none";

            // Check if the data is valid
            if (data.error) {
                alert(data.error);
                return;
            }

            // Update the total number of repositories
            total = data.total_count;

            // Display the repository data
            displayRepos(data.items);

            // Display the pagination controls
            displayPagination();
        })
        .catch(error => {
            // Hide the loader
            loader.style.display = "none";

            // Handle the error
            console.error(error);
            alert("Something went wrong");
        });
}

// Define a function to display the repository data
function displayRepos(repos) {
    // Loop through the repos array
    for (let repo of repos) {
        // Create a list item element
        let li = document.createElement("li");
        li.className = "repo-item";

        // Create a repo name element
        let name = document.createElement("div");
        name.className = "repo-name";
        name.textContent = repo.name;

        // Create a repo description element
        let desc = document.createElement("div");
        desc.className = "repo-desc";
        desc.textContent = repo.description || "No description";

        // Create a repo language element
        let lang = document.createElement("div");
        lang.className = "repo-lang";
        lang.textContent = repo.language || "Unknown";

        // Create a repo topics element
        let topics = document.createElement("div");
        topics.className = "repo-topics";

        // Loop through the repo topics array
        for (let topic of repo.topics) {
            // Create a span element for each topic
            let span = document.createElement("span");
            span.className = "repo-topic";
            span.textContent = topic;

            // Append the span to the topics element
            topics.appendChild(span);
        }

        // Create a repo link element
        let link = document.createElement("a");
        link.className = "repo-link";
        link.href = repo.html_url;
        link.target = "_blank";
        link.textContent = "View on GitHub";

        // Append the elements to the list item
        li.appendChild(name);
        li.appendChild(desc);
        li.appendChild(lang);
        li.appendChild(topics);
        li.appendChild(link);

        // Append the list item to the repo list
        repoList.appendChild(li);
    }
}

// Define a function to display the pagination controls
function displayPagination() {
    // Clear the pagination element
    pagination.innerHTML = "";

    // Create a select element for the per page option
    let select = document.createElement("select");
    select.id = "per-page";

    // Create an array of per page options
    let options = [10, 20, 50, 100];

    // Loop through the options array
    for (let option of options) {
        // Create an option element for each option
        let opt = document.createElement("option");
        opt.value = option;
        opt.textContent = option;

        // Select the current per page value
        if (option === perPage) {
            opt.selected = true;
        }

        // Append the option to the select element
        select.appendChild(opt);
    }

    // Add an event listener to the select element
    select.addEventListener("change", function() {
        // Update the per page value
        perPage = parseInt(this.value);

        // Reset the page number and the repo list
        page = 1;
        repoList.innerHTML = "";

        // Fetch the repository data
        fetchRepos();
    });

// Call the fetchRepos function initially with default values
fetchRepos();
}

if ('WebSocket' in window) {
(function () {
    function refreshCSS() {
        var sheets = [].slice.call(document.getElementsByTagName("link"));
        var head = document.getElementsByTagName("head")[0];
        for (var i = 0; i < sheets.length; ++i) {
            var elem = sheets[i];
            var parent = elem.parentElement || head;
            parent.removeChild(elem);
            var rel = elem.rel;
            if (elem.href && typeof rel != "string" || rel.length == 0 || rel.toLowerCase() == "stylesheet") {
                var url = elem.href.replace(/(&|\?)_cacheOverride=\d+/, '');
                elem.href = url + (url.indexOf('?') >= 0 ? '&' : '?') + '_cacheOverride=' + (new Date().valueOf());
            }
            parent.appendChild(elem);
        }
    }
    var protocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
    var address = protocol + window.location.host + window.location.pathname + '/ws';
    var socket = new WebSocket(address);
    socket.onmessage = function (msg) {
        if (msg.data == 'reload') window.location.reload();
        else if (msg.data == 'refreshcss') refreshCSS();
    };
    if (sessionStorage && !sessionStorage.getItem('IsThisFirstTime_Log_From_LiveServer')) {
        console.log('Live reload enabled.');
        sessionStorage.setItem('IsThisFirstTime_Log_From_LiveServer', true);
    }
})();
}
else {
console.error('Upgrade your browser. This Browser is NOT supported WebSocket for Live-Reloading.');
}
function handleImageUpload(input) {
    const profileImage = document.getElementById('avatarImage');
    const imageInput = document.getElementById('imageInput');

    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            // Update the profile image source
            profileImage.src = e.target.result;

            // Hide the upload button after successful upload
            imageInput.style.display = 'none';
        };

        reader.readAsDataURL(input.files[0]);
    }
}