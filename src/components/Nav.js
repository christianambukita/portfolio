import React, { useEffect, useState } from 'react';
import '../css/Nav.css';
import hamburger from '../img/icons/hamburger_w15.svg';

const wideMinWidth = 600;
export default function Nav({ windowWidth }) {
	const [active, setActive] = useState(false);
	const [wide, setWide] = useState(false);

	useEffect(() => {
		if (windowWidth > wideMinWidth) setWide(true);
		else setWide(false);
	}, [windowWidth]);

	function getNavStyle() {
		const baseClass = 'flex-container';
		const wideClass = wide ? ' nav-wide' : ' nav-small';
		const activeClass = active ? ' active' : '';
		return baseClass + wideClass + activeClass;
	}

	return (
		<nav className={getNavStyle()}>
			<img
				src={hamburger}
				alt='menu button'
				onClick={() => setActive(!active)}
			/>
			<ul className={`flex-container`}>
				<li onClick={() => setActive(false)}>
					<a href='#header'>Home</a>
				</li>
				<li onClick={() => setActive(false)}>
					<a href='#my-work'>My Work</a>
				</li>
				<li onClick={() => setActive(false)}>
					<a href='#about'>About</a>
				</li>
			</ul>
		</nav>
	);
}
