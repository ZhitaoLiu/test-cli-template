import { useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './index.scss';

import { Button } from 'zarm';

const ctx = classNames.bind(styles);

function HomePage() {
  useEffect(() => {
    console.log('123');
  }, []);
  return (
    <div>
      <h1 className={ctx('title', {})}>react h5 template</h1>
      <Button theme="primary">primary</Button>
    </div>
  );
}

export default HomePage;
