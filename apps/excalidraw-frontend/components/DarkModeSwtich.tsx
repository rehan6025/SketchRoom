"use client";
import React, { useEffect, useState } from "react";

const DarkModeSwtich = ({
    checked,
    onChange,
}: {
    checked: boolean;
    onChange: () => void;
}) => {
    return (
        <div className="switch-wrapper ">
            <label className="switch " htmlFor="switch-sun-moon">
                <input
                    type="checkbox"
                    id="switch-sun-moon"
                    onChange={onChange}
                    checked={checked}
                />
                <span className="slider"></span>
            </label>
        </div>
    );
};

export default DarkModeSwtich;
