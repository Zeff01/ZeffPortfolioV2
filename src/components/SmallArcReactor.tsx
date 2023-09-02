import React from "react";
import "../app/arcreactor.css";

const SmallArcReactor = () => {
  return (
    <div className="bottom-4 fixed left-4 z-10  cursor-pointer">
      <div className="arc_reactor_small ">
        <div className="case_container_small ">
          <div className="e7_small ">
            <div className="semi_arc_3_small e5_1">
              <div className="semi_arc_3_small e5_2">
                <div className="semi_arc_3_small e5_3">
                  <div className="semi_arc_3_small e5_4"></div>
                </div>
              </div>
            </div>
            <div className="core2_small"></div>
          </div>
          <ul className="marks_small">
            {Array.from({ length: 60 }, (_, index) => (
              <li key={index}></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SmallArcReactor;
