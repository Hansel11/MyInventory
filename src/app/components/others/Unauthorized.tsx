import CustomHeaderBox from "../utils/CustomHeaderBox"

export default function Unauthorized() {
  return (
    <CustomHeaderBox
      title="Unauthorized"
      subtitle="Anda tidak memiliki akses untuk halaman ini. Silahkan hubungi admin untuk mendapatkan akses."
      />
  );
}

