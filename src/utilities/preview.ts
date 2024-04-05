import urlJoin from 'url-join';

export const getPreviewUrl = (siteId: string, previewRoute: string, serverPort?: number): string => {
	// TODO: remove ENV override closer to GA.
	const serviceHost = process.env.PREVIEW_HOST || 'https://square.online';
	let qs = `site_id=${siteId}&preview_route=${previewRoute}`;
	if (serverPort) {
		qs += `&cli_server_port=${serverPort}`;
	}

	return urlJoin(serviceHost, `/app/website/deeplink/theme-preview?${qs}`);
};
