import { InfinitySpin } from 'react-loader-spinner';
import styles from './style/loader.module.css';
export default function Loader() {
	return (
		<div className={styles.overlay}>
			<div className={styles.overlay__inner}>
				<div className={styles.overlay__content}>
					<div className={styles.loader}>
						<InfinitySpin width="200" color="white" />
					</div>
				</div>
			</div>
		</div>
	);
}
