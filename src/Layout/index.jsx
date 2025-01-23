import Header from './header'
import {Layout} from 'antd'
export default function LayoutContainer({children}) {
  return (
    <Layout className="h-screen overflow-hidden flex flex-col w-full bg-background">
    <Header/>
    <div className="w-full h-full">
     {children}
    </div>
    </Layout>
  )
}
