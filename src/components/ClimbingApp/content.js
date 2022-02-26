import React from 'react';
import addProblemImg from '../../img/climbingApp/AddProblem.png';
import activeProblemImg from '../../img/climbingApp/ActiveProblem.png';
import loadProblemImg from '../../img/climbingApp/LoadProblem.png';
import loadProblem2Img from '../../img/climbingApp/LoadProblem2.png';

const content = [
	{
		title: 'Add problem',
		imgSrc: addProblemImg,
		description: (
			<p>
				This view allows you to create a new problem. You are able to select
				desired grips, name your problem and assign a grade which represents
				problem's level of difficulty. After saving the problem by tapping
				'Dodaj problem' you can acces it in Load problem view or display it on
				right away by tapping 'Przejdź do problemu' in popup window which
				appears after saving a problem.
			</p>
		),
	},
	{
		title: 'Load problem',
		imgSrc: loadProblemImg,
		description: (
			<p>
				In this view you have acces to all saved problems. You can filter
				through them by grade or name. You can also preview a problem by tapping
				its name and select it to be displayed on climbing wall. If you want to
				apply any changes to existing problem this view also gives you acces to
				enter edit mode.
			</p>
		),
	},
	{
		title: 'Active problem',
		imgSrc: activeProblemImg,
		description: (
			<p>
				Active problem view simply displays the problem that is currently
				displayed on the climbing board.
			</p>
		),
	},
];

export default content;
