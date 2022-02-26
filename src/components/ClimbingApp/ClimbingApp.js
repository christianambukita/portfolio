import React from 'react';
import content from './content';
import '../../css/MyWork.css';
import '../../css/ClimbingApp.css';

export default function ClimbingApp() {
	return (
		<main id='climbing-app'>
			<div className='content-container flex-container'>
				<h1>Climbing App</h1>
				<article className='app-description'>
					<p>
						LedoWalls is a single page web app that provides user friendly
						interface to control interactive climbing wall. The climbing wall
						has grips that can be eluminated by an LED to mark that it belongs
						to currently selected path. The app allows you add and save new
						climbing problems (paths) and then display them on the climbing wall
						by eluminating corresponding LEDs.
					</p>
					<p>
						The climbing wall is controlled by Raspberry Pi that runs Node-RED
						server. The app is built in Vue.js and connects to Node-RED server
						via node-red-contrib-uibuilder. Data such as problem lists and app
						active problem state are saved in JSON data base stored on Raspbery
						PI.
					</p>
				</article>
				<div className='my-work-subsection'>
					{content.map((option, i) => (
						<div
							className={'project' + `${i % 2 ? ' r-order' : ''}`}
							key={`project-${i}`}>
							<div className='img-container flex-container'>
								<img
									className='c-img'
									src={option.imgSrc}
									alt='project preview'
								/>
							</div>
							<div className='p-side-container'>
								<div className='p-inner-container'>
									<h2>{option.title}</h2>
									<div className='description'>{option.description}</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
