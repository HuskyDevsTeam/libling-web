"use client"

import React, { useEffect, useState } from 'react'
import styles from './animatedText.module.css'

const AnimatedText = () => {
    const [list, setList] = useState<string[]>(['Unión', 'Igualdad cultural', 'Empatía', 'Confianza'])
    const [activeIndex, setActiveIndex] = useState(0)
    const [move, setMove] = useState(true)

    const nextIndex = (index:number = 0)=>{
        if(index === list.length - 1){
            return 0
        }
        else{
            return index+1
        }
    }
    const prevIndex = (index:number = 0)=>{
        if(index === 0){
            return list.length - 1
        }
        else{
            return index-1
        }
    }
    const moveList = () =>{
        setMove(true)
        setTimeout(()=>{
            setMove(false)
            setList(state=>{
                let newList = [...state]
                const first = newList.shift()
                if(first) newList.push(first)
                return newList
            })
        }, 500)
    }

    useEffect(()=>{
        const interval = setInterval(moveList, 6000);
        return () => clearInterval(interval);
    },[])

  return (
    <div className={styles.contenedor}>
          <div className={move ? styles.contenedorMovil : undefined}>
        {
            list.map((el,index)=>(<p key={index}>{el}</p>))
        }
        </div>
    </div>
  )
}

export default AnimatedText