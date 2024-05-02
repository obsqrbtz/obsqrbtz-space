/**
* Built with the SvelteKit Static Blog Starter
* https://github.com/josh-collinsworth/sveltekit-blog-starter
 **/ 

export const siteTitle = 'Some dev stuff'
export const siteDescription = 'Some dev stuff'
export const siteURL = 'obsqrbtz.space'
export const siteLink = 'https://obsqrbtz.space'
export const siteAuthor = 'Daniel Dada'

// Controls how many posts are shown per page on the main blog index pages
export const postsPerPage = 10

// Edit this to alter the main nav menu. (Also used by the footer and mobile nav.)
export const navItems = [
	{
		title: 'Blog',
		route: '/blog'
	}, {
		title: 'About',
		route: '/about'
	}, {
		title: 'Contact',
		route: '/contact' 
	},
]