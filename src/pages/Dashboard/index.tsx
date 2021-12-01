import { useEffect, useState } from 'react'

import Header from '../../components/Header'
import api from '../../services/api'
import Food from '../../components/Food'
import ModalAddFood from '../../components/ModalAddFood'
import ModalEditFood from '../../components/ModalEditFood'
import { FoodsContainer } from './styles'
import { FoodType } from '../../types'

type StateType = {
  foods: FoodType[]
  editingFood: FoodType
  modalOpen: boolean
  editModalOpen: boolean
}

const Dashboard = () => {
  const [state, setState] = useState({
    foods: [],
    editingFood: {} as FoodType,
    modalOpen: false,
    editModalOpen: false,
  } as StateType)

  useEffect(() => {
    const loadData = async () => {
      const response = await api.get('/foods')
      setState((state) => ({ ...state, foods: response.data }))
    }
    loadData()
  }, [])

  const handleAddFood = async (food: FoodType) => {
    const { foods } = state

    try {
      const response = await api.post<FoodType>('/foods', {
        ...food,
        available: true,
      })

      setState((state) => ({
        ...state,
        foods: [...foods, response.data],
      }))
    } catch (err) {
      console.log(err)
    }
  }

  const handleUpdateFood = async (food: FoodType) => {
    try {
      const foodUpdated = await api.put(`/foods/${state.editingFood.id}`, {
        ...state.editingFood,
        ...food,
      })

      const foodsUpdated = state.foods.map((f) =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data
      )

      setState({ ...state, foods: foodsUpdated })
    } catch (err) {
      console.log(err)
    }
  }

  const handleDeleteFood = async (id: number) => {
    await api.delete(`/foods/${id}`)

    const foodsFiltered = state.foods.filter((food) => food.id !== id)

    setState({ ...state, foods: foodsFiltered })
  }

  const toggleModal = () => {
    setState({ ...state, modalOpen: !state.modalOpen })
  }

  const toggleEditModal = () => {
    setState((s) => ({ ...s, editModalOpen: !s.editModalOpen }))
  }

  const handleEditFood = (food: FoodType) => {
    setState({ ...state, editingFood: food, editModalOpen: true })
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={state.modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={state.editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={state.editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {state.foods &&
          state.foods.map((food) => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  )
}

export default Dashboard
