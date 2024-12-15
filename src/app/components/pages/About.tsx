
import { Box, Button, Typography } from '@mui/material';
import { Link } from "react-router-dom";
import CustomHeaderBox from '../utils/CustomHeaderBox';

// import ImportData from '../utils/ImportData';

export default function About() {
  return (
    <CustomHeaderBox
      title={"About"}
      subtitle={
        <>
          {/* FOR DEBUGGING PURPOSES */}
          {/* <ImportData></ImportData> */}
          {/* UNCOMMENT THIS TO ALLOW INITIAL SEEDING FOR FIREBASE */}

          <Box>
            This web Application is created using React and Firebase.
            <br />
            Feel free to use and modify this code to suit your needs.
            <br />
            If you find this repository helpful, please give it a star.🌟
            <br />
            You can contact me over on:
            <br />
            <link
              rel="stylesheet"
              href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
            ></link>
            <Link
              to="#"
              onClick={(e) => {
                window.location.href = "mailto:hawlzero@gmail.com";
                e.preventDefault();
              }}
            >
              <Button variant="contained" sx={{ marginTop: 2 }}>
                <i
                  className="fa-solid fa-envelope"
                  style={{ marginRight: 16 }}
                ></i>
                Email
              </Button>
            </Link>
            <br />
            <Link
              to="https://github.com/Hansel11"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="contained" sx={{ marginTop: 2 }}>
                <i
                  className="fa-brands fa-github"
                  style={{ marginRight: 16 }}
                ></i>
                GitHub
              </Button>
            </Link>
            <br />
            <Link
              to="https://www.linkedin.com/in/hansel-/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="contained" sx={{ marginTop: 2 }}>
                <i
                  className="fa-brands fa-linkedin-in"
                  style={{ marginRight: 16 }}
                ></i>
                LinkedIn
              </Button>
            </Link>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ pt: 2 }}>
            {"© 2024"}
          </Typography>
        </>
      }
    />
  );
}
