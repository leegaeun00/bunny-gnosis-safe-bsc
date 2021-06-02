import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Button } from '@gnosis.pm/safe-react-components';

import { ZapComponent } from './components/zapComponent';
import { PoolComponent } from './components/poolComponent';
import { WidgetWrapper, ButtonContainer, BottomLargeMargin, StyledLink } from './components/styleComponents';

const App: React.FC = () => {
  return (
      <WidgetWrapper>
        <Router>
            <BottomLargeMargin>
              <ButtonContainer>
                <div>
                <Button size="md" color="primary" variant="bordered">
                  <StyledLink to={'/'} color={'none'}> Pool </StyledLink>
                </Button>
                <Button size="md" color="secondary" variant="bordered">
                  <StyledLink to={'/zap'} color={'none'}> Zap </StyledLink>
                </Button>
                </div>
              </ButtonContainer>
            </BottomLargeMargin>
          <Switch>
            <Route path="/" exact component={PoolComponent}></Route>
            <Route path="/zap" exact component={ZapComponent}></Route>
          </Switch>
        </Router>

      </WidgetWrapper>
  );
}
export default App;
