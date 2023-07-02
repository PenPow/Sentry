export const formatDate = (published: string) => {
	const months = {
		1: 'Jan',
		2: 'Feb',
		3: 'Mar',
		4: 'Apr',
		5: 'May',
		6: 'Jun',
		7: 'Jul',
		8: 'Aug',
		9: 'Sep',
		10: 'Oct',
		11: 'Nov',
		12: 'Dec'
	} as Record<number, string>;

	const date = published.substring(0, 10);

	const [year, month, day] = date.split('-');

	return `${months[parseInt(month)]} ${day}, ${year}`;
};
