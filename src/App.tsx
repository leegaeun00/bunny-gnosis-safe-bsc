import React, {useState} from 'react';
import { BrowserRouter as Router, Switch, Route, useHistory } from 'react-router-dom';
import { Button } from '@gnosis.pm/safe-react-components';

import { ZapComponent } from './components/zapComponent';
import { PoolComponent } from './components/poolComponent';
import { WidgetWrapper, ButtonContainer, BottomLargeMargin, PoolPageButton, ZapPageButton } from './components/styleComponents';


const App: React.FC = () => {

    const [page, setPage] = useState<string>('pool');

    function PoolButton() {
        const history = useHistory();

        function handleClick() {
            history.push('/');
            setPage('pool');
        }

        return (
        <PoolPageButton className={page==='pool' ? 'selected' : ''} size="md" color="primary" variant="outlined" onClick={handleClick}>
            Pool
        </PoolPageButton>)
    }

    function ZapButton() {
        const history = useHistory();

        function handleClick() {
            history.push('/zap');
            setPage('zap');
        }

        return (
        <ZapPageButton className={page==='zap' ? 'selected' : ''} size="md" color="secondary" variant="outlined" onClick={handleClick}>
            Zap
        </ZapPageButton>)
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
