import React from 'react';
import '../../css/MyWork.css';
import projects from './projects';
import animateButton from '../../js/buttonAnimation';
import climbImg from '../../img/sqr/climb.png';
import { Link } from 'react-router-dom';

const handleClick = () => document.documentElement.classList.add('auto-scroll');

export default function MyWork() {
	return (
		<section id='my-work' className='flex-container'>
			<article className='section-container flex-container'>
				<h2>My work</h2>
				<div className='my-work-subsection'>
					<div className='project r-order'>
						<Link to='/climbing-app' onClick={handleClick}>
							<img src={climbImg} alt='project preview' />
						</Link>
						<div className='p-side-container'>
							<div className='p-inner-container'>
								<Link to='/climbing-app' onClick={handleClick}>
									<h3>Climbing App</h3>
								</Link>
								<div className='links-container'>
									<Link
										to='/climbing-app'
										onMouseEnter={() => animateButton('canvas-climb', true)}
										onMouseLeave={() => animateButton('canvas-climb', false)}
										onClick={handleClick}>
										<canvas className='btn-canvas' id='canvas-climb'></canvas>
										DETAILS
									</Link>
								</div>
							</div>
						</div>
					</div>
					{projects.map((project, i) => (
						<div
							className={'project' + `${i % 2 ? ' r-order' : ''}`}
							key={`project-${i}`}>
							<a href={project.liveURL}>
								<img src={project.imgSrc} alt='project preview' />
							</a>
							<div className='p-side-container'>
								<div className='p-inner-container'>
									<a href={project.liveURL}>
										<h3>{project.name}</h3>
									</a>
									<div className='links-container'>
										<a
											onMouseEnter={() => animateButton(`canvas-${i}-g`, true)}
											onMouseLeave={() => animateButton(`canvas-${i}-g`, false)}
											href={project.githubURL}>
											<canvas
												className='btn-canvas'
												id={`canvas-${i}-g`}></canvas>
											VIEW ON GITHUB
										</a>
										<a
											onMouseEnter={() => animateButton(`canvas-${i}-l`, true)}
											onMouseLeave={() => animateButton(`canvas-${i}-l`, false)}
											href={project.liveURL}>
											<canvas
												className='btn-canvas'
												id={`canvas-${i}-l`}></canvas>
											VIEW LIVE VERSION
										</a>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</article>
		</section>
	);
}
