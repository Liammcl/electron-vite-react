import logo from "@/assets/logo.png";
export default function logoWarp() {
  return (
     <img
        draggable={false}
        src={logo}
        alt=""
        className="xl:w-[240px] xl:h-[100px] md:w-[160px] md:h-[60px] w-[80px] h-[30px] object-fill"
      />
  )
}
