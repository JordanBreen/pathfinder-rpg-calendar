document.body.querySelector('header').innerHTML += `
<nav class='navbar navbar-expand-sm navbar-dark bg-dark'>
	<div class='container-fluid'>
		<a class='navbar-brand' href='home.html'>Will-O'-Wisp</a>
		<ul class='navbar-nav'>
			<li class='nav-item active'>
				<a class='nav-link' href='home.html'>Home</a>
			</li>
			<li class='nav-item'>
				<a class='nav-link' href='calendar.html'>Calendar</a>
			</li>
			<li class='nav-item'>
				<a class='nav-link' href='about.html'>About</a>
			</li>
		</ul>
		<ul class='navbar-nav'>
			<li class='nav-item'>
				<a class='nav-link' href='./sign_up.php'>
					<i class='bi-person-plus'></i> Sign Up
				</a>
			</li>
			<li class='nav-item'>
				<a class='nav-link' href='./login.php' target='_self'>
					<i class='bi-door-open'></i> Login
				</a>
			</li>
		</ul>
	</div>
</nav>
`;