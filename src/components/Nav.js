import React, { useEffect, useState } from 'react';
import { HashLink } from 'react-router-hash-link';
import '../css/Nav.css';
import hamburger from '../img/icons/hamburger_w15.svg';

const wideMinWidth = 600;
export default function Nav({ windowWidth }) {
	const [active, setActive] = useState(false);
	const [wide, setWide] = useState(false);

	useEffect(() => {
		if (windowWidth > wideMinWidth) {
			setWide(true);
			setActive(false);
		} else setWide(false);
	}, [windowWidth]);

	function getNavStyle() {
		const baseClass = 'flex-container';
		const wideClass = wide ? ' nav-wide' : ' nav-small';
		const activeClass = active ? ' active' : '';
		return baseClass + wideClass + activeClass;
	}

	function handleClick(e) {
		const isTarget = e.target === e.currentTarget;
		if (active && isTarget) setActive(false);
	}

	return (
		<nav className={getNavStyle()} onClick={handleClick}>
			<img
				src={hamburger}
				alt='menu button'
				onClick={() => setActive(!active)}
			/>
			<ul className={`flex-container`}>
				<li onClick={() => setActive(false)}>
					<HashLink to='/#header'>Home</HashLink>
				</li>
				<li onClick={() => setActive(false)}>
					<HashLink to='/#my-work'>My Work</HashLink>
				</li>
				<li onClick={() => setActive(false)}>
					<HashLink to='/#about'>About</HashLink>
				</li>
			</ul>
		</nav>
	);
}
