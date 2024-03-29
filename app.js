const star = `<svg viewBox="0 0 16 16">
    <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"></path>
</svg>`
const fork = `<svg viewBox="0 0 16 16">
    <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path>
</svg>`
const version = '2.1.0'

class GitHubRepoCards extends HTMLElement {
    constructor() {
        super()
    }

    async connectedCallback() {
        const background = this.getAttribute('data-background')
        const user = this.getAttribute('data-user')

        await this.addStyling()
        await this.renderCards(user)

        this.style.background = background || '#0d1117'
    }

    async renderCards(user) {
        let popular = []
        let unpopular = []

        let res = await fetch(`https://api.github.com/users/${ user || 'github' }/repos`)
        let repos = await res.json()

        repos.forEach(repo => {
            if (repo.stargazers_count > 0 || repo.forks > 0) return popular.push(repo)
            unpopular.push(repo)
        })

        popular = popular.sort((a, b) => b.stargazers_count - a.stargazers_count)

        if (popular.length < 6) {
            for (let i = 0; i <= 6 - popular.length; i++) popular.push(unpopular[i])
        } else {
            for (let i = 6; i <= popular.length; i++) popular.splice(i)
        }

        popular = popular.sort((a, b) => b.stargazers_count - a.stargazers_count)

        popular.forEach(pop => {
            this.innerHTML += this.newCard(pop)
        })
    }

    newCard(cardData) {
        if(!cardData) return ''
        const {
            full_name: title,
            html_url: htmlUrl,
            description,
            language,
            stargazers_count: stars,
            forks
        } = cardData
        const targetBlank = this.getAttribute('data-target-blank') == 'true' ? `target="_blank" rel="noopener"` : ''

        return `
        <div class="github-repo-card">
            <div>
                <a href="${ htmlUrl }" ${ targetBlank }>${ title }</a>
                <p class="desc">${ description ?? '' }</p>
            </div>

            <div class="forks-stars-lang">
                ${
                    language ?
                    `<p class="lang">
                        <span class="lang-color ${ language }"></span>${ language }
                    </p>` : ''
                }
                
                ${ 
                    stars ?
                    `<a class="stars stars-forks" href="${ htmlUrl + '/stargazers' }" ${ targetBlank }>
                        ${ star }<span>${ stars }</span>
                    </a>` : ''
                }
                ${
                    forks ? 
                    `<a class="forks stars-forks" href="${ htmlUrl + '/network/members' }" ${ targetBlank }>
                        ${ fork }<span>${ forks }</span>
                    </a>` : ''
                }
            </div>
        </div>
        `
    }
    async addStyling() {
        const cssRes = await fetch(`https://cdn.jsdelivr.net/npm/github-repo-cards@${ version }/style.css`)
        const css = await cssRes.text()
        this.innerHTML = `<style>${ css }</style>`
    }
}

customElements.define('github-repo-cards', GitHubRepoCards)