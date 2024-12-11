import {
  Box
} from "@mui/material";


function CustomHeaderBox(props: any) {
  

  return (
    <Box
      sx={{
        boxShadow: 6,
        borderRadius: 6,
        padding: 5,
        paddingBottom: 3,
        marginBottom: 4,
        display: "flex",
        backgroundColor: "background.default",
      }}
    >
      <Box
      flexGrow={1}

      >
        <h1
          style={{
            display: "flex",
            alignItems: "center",
            flexGrow: 1,
            marginTop: 0,
          }}
        >
          {props.title}
        </h1>
        <Box paddingBottom={props.subtitle ? 2 : 0}>{props.subtitle}</Box>
      </Box>
      <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 1
      }}
      >{props.right}</Box>
    </Box>
  );
        }

export default CustomHeaderBox;
