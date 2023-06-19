const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbpath = path.join(__dirname, "moviesData.db");
let DB = null;

const connectionAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running");
    });
  } catch (error) {
    console.log(`db error ${error.message}`);
    process.exit(1);
  }
};

connectionAndServer();

const convertMovieTable = (dbobject) => {
  return {
    movieId: dbobject.movie_id,
    directorId: dbobject.director_id,
    movieName: dbobject.movie_name,
    leadActor: dbobject.lead_actor,
  };
};

const convertDirectorTable = (dbobject) => {
  return {
    directorId: dbobject.director_id,
    directorName: dbobject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const Query1 = `SELECT movie_name FROM movie;`;
  const result = await DB.all(Query1);
  response.send(result);
});
