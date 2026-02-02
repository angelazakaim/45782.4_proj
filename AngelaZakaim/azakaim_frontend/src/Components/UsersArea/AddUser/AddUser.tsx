import { useForm } from "react-hook-form";
import "./AddUser.css";
import type { LegacyUserFormData } from "../../../Models/User";
import { notificationService } from "../../../Services/NotificationService";
import { UserRole } from "../../../Models/Enums";
import { useHasRole } from "../../../Utils/useHasRole";

export function AddUser() {

    useHasRole([UserRole.ADMIN, UserRole.MANAGER]);

    const {register, handleSubmit, formState} = useForm<LegacyUserFormData>({mode:'all'});

    function addUser(_user:LegacyUserFormData){
        // This component uses a legacy interface - needs to be refactored to match current API
        notificationService.error("This feature is not yet implemented with the current API")
    }

    return (
        <div className="AddUser">
            <h2>New User</h2>
            <hr/>
            <form onSubmit={handleSubmit(addUser)}>
                <label htmlFor="">First Name</label><br/>
                <input type="text" {...register('firstName', {required: {value:true, message:'First name is required'}})} /><br/>
                {formState.errors.firstName && <span className="error">{formState.errors.firstName?.message}</span>}
                
                <label htmlFor="">Last Name</label><br/>
                <input type="text" {...register('lastName',{required: {value:true, message:'Last name is required'}})}/><br/>
                {formState.errors.lastName && <span className="error">{formState.errors.lastName?.message}</span>}

                <label htmlFor="">Age</label><br/>
                <input type="number"  {...register('age',{min: {value:0, message:'Age cannot be negative'}, max:{value:120, message:"Age must be realistic"}})}/><br/>
                {formState.errors.age && <span className="error">{formState.errors.age?.message}</span>}

                <label htmlFor="">Gender</label><br/>
                <select {...register('gender',{required: {value:true, message:'Gender is required'}})}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select><br/>
                {formState.errors.gender && <span className="error">{formState.errors.gender?.message}</span>}

                <label htmlFor="">Role</label><br/>
                <input type="text" {...register('role',{required: {value:true, message:'Role is required'}})}/><br/>
                {formState.errors.role && <span className="error">{formState.errors.role?.message}</span>}
                <br/>

                <button>Add</button>
            </form>
        </div>
    );
}