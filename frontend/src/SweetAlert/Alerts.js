import Swal from "sweetalert2";

export function successAlert(title, message) {
  Swal.fire({
    icon: "success",
    title: `${title}`,
    text: `${message}`,
    showConfirmButton: false,
    timerProgressBar: true,
    timer: 1000,
  });
}

export function errorAlert(message) {
  Swal.fire({
    icon: "error",
    text: `${message}`,
  });
}
