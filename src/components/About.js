import React from 'react';
import '../css/About.css';
import gitHubIcon from '../img/icons/GitHub-Mark-Light-64px.png';

export default function About() {
	return (
		<section id='about'>
			<div className='section-container'>
				<h2>Who am I?</h2>
				<article>
					My name is Christian Ambukita and I'm an aspiring front-end developer.
					I graduated from Poznań University of Technology with a masters degree
					in Automatic control and Robotics. During my final years of college I
					realised that coding is what I would like to do as a job. After
					graduation I started to learn HTML, CSS and JavaScript as I decided to
					become a front-end web developer. My favorite and mainly used
					framework is React. This website showcases some of projects I did
					during my learning process. To see more of my projects visit my{' '}
					<a href='https://github.com/christianambukita?tab=repositories'>
						github
					</a>
					.
				</article>
			</div>
			<a
				className='github-icon-link'
				href='https://github.com/christianambukita?tab=repositories'>
				<img src={gitHubIcon} alt='github-logo' />
			</a>
		</section>
	);
}
