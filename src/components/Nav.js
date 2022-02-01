import React from 'react';
import '../css/Nav.css';

export default function Nav() {
	return (
		<nav className='flex-container'>
			<ul className='flex-container'>
				<li>
					<a href='#header'>Home</a>
				</li>
				<li>
					<a href='#my-work'>My Work</a>
				</li>
				<li>
					<a href='#about'>About</a>
				</li>
			</ul>
		</nav>
	);
}
