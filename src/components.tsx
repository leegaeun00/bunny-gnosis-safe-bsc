import React from 'react';
import styled from 'styled-components';

export const SelectContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: left;
  margin-bottom: 15px;
  *:first-child {
    margin-right: 5px;
  }
`;

export const DaiInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: left;
  margin-bottom: 15px;
  width: 100%;
  > * {
    display: flex;
    width: 100%;
    justify-content: space-between;
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 15px;
  margin-bottom: 15px;
`;

export const BottomLargeMargin = styled.div`
  margin-bottom: 60px;
`;

export const BottomSmallMargin = styled.div`
  margin-bottom: 25px;
`;

const Card = styled.div`
  display: flex;
  justify-content: left;
  padding: 24px;
`;

export const WidgetWrapper: React.FC = ({ children }) => (
    <Card>
        <div>{children}</div>
    </Card>
);