import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import { Button, TableHead, Typography } from "@mui/material";

function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

export default function PaginationTable({ jobData }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { data } = jobData;

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <TableContainer component={Paper} sx={{ width: "100%", fontSize: "12px" }}>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
          <Box
            sx={{ width: 20, height: 20, backgroundColor: "#DAF7A6", mr: 1 }}
          />
          <Typography variant="body2">
            Las coincidencias están en verde
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{ width: 20, height: 20, backgroundColor: "#F5D170", mr: 1 }}
          />
          <Typography variant="body2">
            Las sugerencias están en anaranjado
          </Typography>
        </Box>
      </Box>
      <Table sx={{ minWidth: 300 }} aria-label="custom pagination table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ padding: "4px", fontSize: "12px" }}>
              Compañía
            </TableCell>
            <TableCell sx={{ padding: "4px", fontSize: "12px" }}>
              País
            </TableCell>
            <TableCell sx={{ padding: "4px", fontSize: "12px" }}>
              Nombre
            </TableCell>
            <TableCell sx={{ padding: "4px", fontSize: "12px" }}>
              Trabajo
            </TableCell>
            <TableCell sx={{ padding: "4px", fontSize: "12px" }}>
              Skills
            </TableCell>
            <TableCell sx={{ padding: "4px", fontSize: "12px" }}>
              Universidad
            </TableCell>
            <TableCell sx={{ padding: "4px", fontSize: "12px" }}>
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(rowsPerPage > 0
            ? data?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : data
          ).map((row, index) => (
            <TableRow
              style={{
                backgroundColor: row["related "] === 0 ? "#DAF7A6" : "#F5D170",
                color: "white",
              }}
              key={index}
            >
              <TableCell sx={{ padding: "4px", fontSize: "12px" }}>
                {row.company}
              </TableCell>{" "}
              <TableCell sx={{ padding: "4px", fontSize: "12px" }}>
                {row.country}
              </TableCell>
              <TableCell sx={{ padding: "4px", fontSize: "12px" }}>
                {row.fullname}
              </TableCell>
              <TableCell sx={{ padding: "4px", fontSize: "12px" }}>
                {row.job_title}
              </TableCell>
              <TableCell sx={{ padding: "4px", fontSize: "12px" }}>
                {row.skills}
              </TableCell>
              <TableCell sx={{ padding: "4px", fontSize: "12px" }}>
                {row.university}
              </TableCell>
              <TableCell sx={{ padding: "4px", fontSize: "12px" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => window.open(row.url, "_blank")}
                  sx={{
                    minWidth: "32px",
                    padding: "2px 8px",
                    fontSize: "10px",
                  }}
                >
                  Ver
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {emptyRows > 0 && (
            <TableRow style={{ height: 53 * emptyRows }}>
              <TableCell colSpan={8} />
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
              colSpan={8}
              count={data.length}
              rowsPerPage={rowsPerPage}
              page={page}
              SelectProps={{
                inputProps: {
                  "aria-label": "rows per page",
                },
                native: true,
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}

PaginationTable.propTypes = {
  jobData: PropTypes.shape({
    data: PropTypes.arrayOf(
      PropTypes.shape({
        company: PropTypes.string.isRequired,
        country: PropTypes.string.isRequired,
        fullname: PropTypes.string.isRequired,
        job_title: PropTypes.string.isRequired,
        skills: PropTypes.string.isRequired,
        university: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
        "related ": PropTypes.number.isRequired, // Notación de corchetes en PropTypes
      })
    ).isRequired,
  }).isRequired,
};
