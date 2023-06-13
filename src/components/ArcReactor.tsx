import React from "react";
import "../app/arcreactor.css";

const ArcReactor = () => {
  return (
    <div className="bottom-0 fixed left-4 w-40 h-40    cursor-pointer">
      <div className="arc_reactor">
        <div className="case_container">
          <div className="e7">
            <div className="semi_arc_3 e5_1">
              <div className="semi_arc_3 e5_2">
                <div className="semi_arc_3 e5_3">
                  <div className="semi_arc_3 e5_4"></div>
                </div>
              </div>
            </div>
            <div className="core2"></div>
          </div>
          <ul className="marks">
            {Array.from({ length: 60 }, (_, index) => (
              <li key={index}></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ArcReactor;
