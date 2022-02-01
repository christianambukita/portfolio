import React from 'react';
import '../../css/MyWork.css';
import projects from './projects';
import animateButton from '../../js/buttonAnimation';

export default function MyWork() {
	return (
		<section id='my-work' className='flex-container'>
			<article className='section-container flex-container'>
				<h2>My work</h2>
				<div className='my-work-subsection'>
					{projects.map((project, i) => (
						<div
							className={'project' + `${i % 2 ? ' r-order' : ''}`}
							key={`project-${i}`}>
							<img src={project.imgSrc} alt='project preview' />
							<div className='p-side-container'>
								<div className='p-inner-container'>
									<h3>{project.name}</h3>
									<div className='links-container'>
										<a
											onMouseEnter={() => animateButton(`canvas-${i}-g`, true)}
											onMouseLeave={() => animateButton(`canvas-${i}-g`, false)}
											href=''>
											<canvas
												className='btn-canvas'
												id={`canvas-${i}-g`}></canvas>
											VIEW ON GITHUB
										</a>
										<a
											onMouseEnter={() => animateButton(`canvas-${i}-l`, true)}
											onMouseLeave={() => animateButton(`canvas-${i}-l`, false)}
											href=''>
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
