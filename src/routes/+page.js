import { error } from '@sveltejs/kit'

export const load = async () => {
	try {
		const AboutMdFile = await import('./about/+page.md')
		const AboutMd = AboutMdFile.default
		
		return {
			AboutMd
		}
	}
	catch(err) {
		error(500, err);
	}
}
