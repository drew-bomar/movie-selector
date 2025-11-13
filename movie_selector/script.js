const apiKey = "22b0a8797d95cb492c8faf11d1871dce"; // Replace with your TMDB API key

const genreSelect = document.getElementById("genreSelect");
const decadeStart = document.getElementById("decadeStart");
const decadeEnd = document.getElementById("decadeEnd");
const submitBtn = document.getElementById("submitBtn");
const minimumRating = document.getElementById("minRating");
const movieResult = document.getElementById("movieResult");
const errorMessage = document.getElementById("errorMessage");


//make sure we don't have invalid decade selection (end is before start)
function validateDecades() {
    const startValue = decadeStart.value;
    const endValue = decadeEnd.value;

    const startYear = parseInt(startValue);
    const endYear = parseInt(endValue);

    if (endYear < startYear) {
        return false;
    }

    return true;
}

//load genres from TMDb API and populate genre select element
async function loadGenres(){
    console.log("loading Genres from TMDb API");

    try{
        const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`);

        const data = await response.json();
        console.log("Genres Received: ", data);

        data.genres.forEach(genre => {
            const option = document.createElement("option");
            option.value = genre.id;
            option.textContent = genre.name;
            genreSelect.appendChild(option);
        });

        console.log("Genres loaded into select element.");

    } catch(error){
        console.error("Error fetching genres: ", error);
        alert("Failed to load genres. Check your API key and network connection.");
    }
}

//retrieve array of movies fitting user criteria and select one at random
async function findRandomMovie() {
    console.log("Starting movie search");

    //retrieve user selections
    const genreId = genreSelect.value;
    const startYear = parseInt(decadeStart.value);
    const endYear = parseInt(decadeEnd.value);
    const minRating = parseInt(minimumRating.value);

    //base url
    let apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}`;

    //append filter urls
    if (genreId) {
        apiUrl += `&with_genres=${genreId}`;
    }   

    if( startYear && startYear != "Select Decade Start"){
        apiUrl += `&primary_release_date.gte=${startYear}-01-01`;
    }
    
    if( endYear && endYear != "Select Decade End"){
        apiUrl += `&primary_release_date.lte=${endYear}-12-31`;
    }

    console.log("pre min");

    if(minRating && minRating != "Select Minimum Rating"){
        apiUrl += `&vote_average.gte=${minRating}`;
    }

    console.log("post min");

    apiUrl += `&vote_count.gte=100`;

    try{
        //fetch movies based on criteria
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log(`Found ${data.results.length} movies matching criteria.`);

        console.log("Movies Received: ", data);

        if(data.results.length ==0){
            showError("No movies found matching your criteria, try adjusting your filters.");
            return;
        }

        //select random movie from movie array
        const randomIndex = Math.floor(Math.random() * data.results.length);
        const randomMovie = data.results[randomIndex];

        displayMovie(randomMovie);


        console.log("Random Movie Selected: ", randomMovie);
    } catch(error){

        console.error("Error fetching movies: ", error);
        alert("Failed to fetch movies. Please try again.");
    }
}

function displayMovie(movie){
    console.log("Displaying movie: ", movie);

    //hide and clear previous errors
    errorMessage.classList.add('hidden');
    errorMessage.textContent = '';

    //build movie html
    let movieHTML = `<div class="movie-card"> 
            <h2>${movie.title}</h2>
    <p class ="Year"> Released: ${movie.release_date ? movie.release_date.substring(0,4) : "Unknown"}</p>
    `;

    //add movie poster if available
    if(movie.poster_path){
        movieHTML+= `<img src = "https://image.tmdb.org/t/p/w300${movie.poster_path}" 
        alt="${movie.title} poster">`;
    }else{
        movieHTML+= `<p>No poster available</p>`;
    }

    //add rest of movie information
    movieHTML += `<p class="rating"> ⭐  ${movie.vote_average}/10 (${movie.vote_count} votes) </p>
                    <p class="overview">${movie.overview || 'No description available.'}</p>
                </div>
                `;

    //add new movie html to the movieResult div in index.html
    movieResult.innerHTML = movieHTML;
    movieResult.classList.remove('hidden');
}

function showError(message ){
    movieResult.classList.add('hidden');

    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}


//only load genres once document is fully loaded
document.addEventListener('DOMContentLoaded', function(){
    console.log("Document fully loaded, fetching genres now.");
    loadGenres();
});

submitBtn.addEventListener('click', function() {
    if (!validateDecades()) {
        showError("End Decade must be greater than or equal to Start Decade. Please edit your filters and try again.");
        return;
    }
    findRandomMovie();
});