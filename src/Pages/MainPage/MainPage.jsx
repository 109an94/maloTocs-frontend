// MainPage.jsx (히어로 아래에 배치)
import MainHome from "./MainHome";
import PartSelect from "./PartSelect";
import { useState } from "react";

export default function MainPage() {
  const [selected, setSelected] = useState("part2");

  return (
    <div className="min-h-screen bg-gray-50">
      <MainHome />
      <PartSelect
        selectedId={selected}
        onSelect={(id) => {
          setSelected(id);
          // 여기서 라우팅하거나 모달을 열면 됨
          // navigate(`/speaking/${id}`)
        }}
      />
    </div>
  );
}