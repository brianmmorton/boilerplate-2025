export function getBrowserName(userAgent: string) {
	let browserName = 'Unknown';
	if (userAgent.indexOf('Firefox') > -1) {
		browserName = 'Mozilla Firefox';
	} else if (userAgent.indexOf('SamsungBrowser') > -1) {
		browserName = 'Samsung Internet';
	} else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
		browserName = 'Opera';
	} else if (userAgent.indexOf('Trident') > -1) {
		browserName = 'Microsoft Internet Explorer';
	} else if (userAgent.indexOf('Edge') > -1) {
		browserName = 'Microsoft Edge';
	} else if (userAgent.indexOf('Chrome') > -1) {
		browserName = 'Google Chrome';
	} else if (userAgent.indexOf('Safari') > -1) {
		browserName = 'Safari';
	}
	return browserName;
}
