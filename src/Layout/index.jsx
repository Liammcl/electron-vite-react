import {Layout} from 'antd'
export default function LayoutContainer({children}) {
  return (
    <Layout className="h-screen overflow-hidden flex flex-col w-full bg-background">
    <div className="w-full h-auto overflow-auto">
     {children}
    </div>
    </Layout>
  )
}
