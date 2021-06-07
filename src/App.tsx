import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link, useHistory } from 'react-router-dom';
import { Button } from '@gnosis.pm/safe-react-components';

import { ZapComponent } from './components/zapComponent';
import { PoolComponent } from './components/poolComponent';
import { WidgetWrapper, ButtonContainer, BottomLargeMargin } from './components/styleComponents';


const App: React.FC = () => {
    function PoolButton() {
        const history = useHistory();

        function handleClick() {
            history.push('/');
        }

        return (
        <Button size="md" color="primary" variant="bordered" onClick={handleClick}>
            Pool
        </Button>)
    }

    function ZapButton() {
        const history = useHistory();

        function handleClick() {
            history.push('/zap');
        }

        return (
        <Button size="md" color="secondary" variant="bordered" onClick={handleClick}>
            Zap
        </Button>)
    }

  return (
      <WidgetWrapper>
        <Router>
            <BottomLargeMargin>
              <ButtonContainer>
                <div>
                <PoolButton />
                <ZapButton />
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
