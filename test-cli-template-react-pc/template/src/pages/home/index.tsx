import { useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './index.less';

const ctx = classNames.bind(styles);

function HomePage() {
  useEffect(() => {
    console.log('123');
  }, []);
  return (
    <div>
      <h1 className={ctx('title', {})}>react pc template</h1>
    </div>
  );
}

export default HomePage;
