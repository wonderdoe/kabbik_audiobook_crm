import React, { useState } from 'react';
import { DateTimePicker } from '@mantine/dates';
import { MantineProvider } from '@mantine/core';
import { tProps } from './static/types';

export default function CustomDateTimePicker({label,placeholder,changeHandler,value,error}:tProps) {

  return (
    <MantineProvider>
      <div style={{ }}>
        <DateTimePicker
          label={label}
          placeholder={placeholder}
          value={value}
          onChange={changeHandler}
          clearable
        //   maw={400}
        //   mx="auto"
            minDate={new Date()}
        />
        <p style={{ color:"#FA5252",marginTop:"0",fontSize:"12px" }}>
          {error? 'No date selected':''}
        </p>
      </div>
    </MantineProvider>
  );
}
