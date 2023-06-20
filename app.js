const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());
let database = null;

const createAndConnect = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running");
    });
  } catch (e) {
    console.log(`db error ${e.message}`);
    process.exit(1);
  }
};

createAndConnect();

const convertMovieTable = (dbobject) => {
  return {
    movieId: dbobject.movie_id,
    directorId: dbobject.director_id,
    movieName: dbobject.movie_name,
    leadActor: dbobject.lead_actor,
  };
};

const convertDirector = (dbobj) => {
  return {
    directorId: dbobj.director_id,
    directorName: dbobj.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const moviesQuery = `SELECT movie_name FROM movie;`;
  const moviesList = await database.all(moviesQuery);
  response.send(moviesList.map(convertMovieTable));
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieQuery = ` SELECT * FROM movie WHERE movie_id=${movieId};`;
  const resultMovie = await database.get(movieQuery);
  response.send(convertMovieTable(resultMovie));
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addmovieQuery = `INSERT INTO movie (director_id, movie_name,lead_actor) VALUES (${directorId},${movieName},${leadActor});`;
  await database.run(addmovieQuery);
  response.send("Movie Successfully Added");
});

app.put("/movies/:movieId", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateQuery = `UPDATE movie SET director_id = ${directorId},movie_name = ${movieName}, lead_actor = ${leadActor} WHERE movie_id = ${movieId};`;
  await database.run(updateQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQery = `DELETE movie WHERE movie_id = ${movieId};`;
  await database.run(deleteQery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const directorsQuery = `SELECT * FROM director;`;
  const directoslist = await database.all(directorsQuery);
  response.send(directoslist.map(convertDirector));
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorMoviesQ = `SELECT movie_name FROM movie WHERE director_id = ${directorId};`;
  const movieList = await database.all(directorMoviesQ);
  response.send(
    movieList.map((eachmovie) => ({ movieName: eachmovie.movie_name }))
  );
});

module.exports = app;
