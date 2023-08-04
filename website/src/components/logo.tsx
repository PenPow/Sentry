import Image from 'next/image';
import LogoImage from '../../public/SentryShieldOnly.png';

export function Logo() {
	return <Image src={LogoImage} alt="Sentry Logo" width={32} height={36} />
}