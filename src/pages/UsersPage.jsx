import React from 'react';
import {useTitle} from "../hooks/useTitle";

export const UsersPage = () => {
  useTitle('Student Fee Management Tab');
  return (
    <div>
      <h1>No User Found </h1>
    </div>
  );
};